import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../axiosInstance';
import EndPoints from '../EndPoints';

const UTI_TO_MIME: Record<string, string> = {
  'public.png': 'image/png',
  'public.jpeg': 'image/jpeg',
  'public.jpg': 'image/jpeg',
  'public.heic': 'image/heic',
  'public.image': 'image/jpeg',
  'com.adobe.pdf': 'application/pdf',
  'public.plain-text': 'text/plain',
  'public.comma-separated-values-text': 'text/csv',
  'com.microsoft.word.doc': 'application/msword',
  'org.openxmlformats.wordprocessingml.document':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function normalizeAttachmentMimeType(type?: string): string {
  if (!type) return 'application/octet-stream';
  if (type.includes('/')) return type;
  return UTI_TO_MIME[type] ?? 'application/octet-stream';
}

function normalizeAttachmentUri(uri: string): string {
  if (!uri) return uri;
  if (uri.startsWith('content://') || uri.startsWith('file://')) return uri;
  return `file://${uri}`;
}

function buildFormDataFile(file: {
  uri: string;
  name: string;
  type: string;
}) {
  const mimeType = normalizeAttachmentMimeType(file.type);
  const fileName = file.name?.trim() || `attachment_${Date.now()}`;

  return {
    uri: normalizeAttachmentUri(file.uri),
    type: mimeType,
    name: fileName,
  };
}

export type SupportTicketStatus =
  | 'open'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | string;

export type SupportTicketPriority = 'low' | 'medium' | 'high' | string;

export interface SupportReportType {
  _id: string;
  id?: string;
  type?: string;
  name: string;
  label?: string;
  audience?: string;
  isOther?: boolean;
}

export interface SupportTicketAttachment {
  url?: string;
  fileName?: string;
  name?: string;
  mimeType?: string;
}

export interface SupportTicket {
  _id: string;
  id?: string;
  ticketId?: string;
  title: string;
  description?: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  reportType?: string | { _id?: string; name?: string; type?: string };
  reportTypeName?: string;
  isOtherReportType?: boolean;
  attachments?: SupportTicketAttachment[] | string[];
  adminComment?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupportTicketListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface CreateSupportTicketInput {
  title: string;
  description: string;
  priority: SupportTicketPriority;
  reportTypeId?: string;
  isOtherReportType?: boolean;
  attachments?: Array<{
    uri: string;
    name: string;
    type: string;
    size?: number;
  }>;
}

const supportKeys = {
  all: ['customerSupportTickets'] as const,
  list: (params: SupportTicketListParams) =>
    [...supportKeys.all, 'list', params] as const,
  detail: (id: string) => [...supportKeys.all, 'detail', id] as const,
  reportTypes: () => [...supportKeys.all, 'reportTypes'] as const,
};

function unwrapList(resp: any): SupportTicket[] {
  const rd = resp?.ResponseData ?? resp?.data;
  if (Array.isArray(rd)) return rd.map(normalizeSupportTicket);
  if (Array.isArray(rd?.data)) return rd.data.map(normalizeSupportTicket);
  if (Array.isArray(rd?.tickets)) return rd.tickets.map(normalizeSupportTicket);
  if (Array.isArray(rd?.items)) return rd.items.map(normalizeSupportTicket);
  if (Array.isArray(rd?.list)) return rd.list.map(normalizeSupportTicket);
  if (Array.isArray(rd?.results)) return rd.results.map(normalizeSupportTicket);
  if (Array.isArray(rd?.docs)) return rd.docs.map(normalizeSupportTicket);
  if (Array.isArray(resp?.tickets)) return resp.tickets.map(normalizeSupportTicket);
  return [];
}

function normalizeSupportTicket(raw: any): SupportTicket {
  if (!raw || typeof raw !== 'object') {
    return raw as SupportTicket;
  }
  const reportType =
    raw.reportType ??
    raw.report_type ??
    (raw.reportTypeId && typeof raw.reportTypeId === 'object'
      ? raw.reportTypeId
      : undefined);

  return {
    ...raw,
    _id: raw._id || raw.id || raw.ticketId,
    ticketId: raw.ticketId || raw.ticket_id || raw.ticketNumber,
    title: raw.title || raw.subject || '',
    description: raw.description || raw.body || raw.message,
    status: raw.status,
    priority: raw.priority,
    reportType,
    reportTypeName:
      raw.reportTypeName ||
      raw.report_type_name ||
      raw.reportTypeLabel ||
      (typeof reportType === 'object'
        ? reportType?.name || reportType?.type
        : undefined) ||
      (typeof raw.reportTypeId === 'object'
        ? raw.reportTypeId?.name || raw.reportTypeId?.type
        : undefined),
    isOtherReportType: Boolean(raw.isOtherReportType ?? raw.is_other_report_type),
    attachments: raw.attachments || raw.files,
    adminComment: raw.adminComment ?? raw.admin_comment,
    createdAt: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
  };
}

const STATUS_QUERY_MAP: Record<string, string> = {
  open: 'open',
  in_progress: 'in_progress',
  resolved: 'resolved',
  closed: 'closed',
};

function toApiStatusFilter(status?: string): string | undefined {
  if (!status || status === 'all') return undefined;
  return STATUS_QUERY_MAP[status] || status;
}

export function extractSupportTicketPagination(resp: any) {
  const p = resp?.pagination ?? resp?.ResponseData?.pagination;
  return {
    page: Number(p?.page ?? 1),
    limit: Number(p?.limit ?? 10),
    total: Number(p?.total ?? 0),
    pages: Number(p?.pages ?? 0),
  };
}

function unwrapDetail(resp: any): SupportTicket | null {
  const rd = resp?.ResponseData ?? resp?.data;
  if (!rd) return null;
  if (rd.ticket) return normalizeSupportTicket(rd.ticket);
  if (rd._id || rd.id || rd.ticketId) return normalizeSupportTicket(rd);
  return null;
}

function normalizeReportType(raw: any): SupportReportType | null {
  if (!raw || typeof raw !== 'object') return null;

  const name = String(raw.name || raw.label || raw.type || '').trim();
  const _id = raw._id || raw.id;
  if (!_id || !name) return null;

  return {
    _id,
    id: raw.id,
    type: raw.type,
    name,
    label: raw.label,
    audience: raw.audience,
    isOther: Boolean(raw.isOther ?? raw.is_other),
  };
}

function isCustomerReportType(reportType: SupportReportType): boolean {
  if (!reportType.audience) return true;
  const audience = reportType.audience.toLowerCase();
  return audience === 'customer';
}

function unwrapReportTypes(resp: any): SupportReportType[] {
  const rd = resp?.ResponseData ?? resp?.data;
  let list: any[] = [];
  if (Array.isArray(rd)) list = rd;
  else if (Array.isArray(rd?.data)) list = rd.data;
  else if (Array.isArray(rd?.reportTypes)) list = rd.reportTypes;
  else if (Array.isArray(rd?.items)) list = rd.items;

  return list
    .map(normalizeReportType)
    .filter((item): item is SupportReportType => Boolean(item))
    .filter(isCustomerReportType);
}

export function getSupportTicketDisplayId(ticket: SupportTicket): string {
  return ticket.ticketId || ticket._id || ticket.id || '—';
}

export function getSupportTicketReportTypeName(ticket: SupportTicket): string {
  if (ticket.reportTypeName) return ticket.reportTypeName;
  if (typeof ticket.reportType === 'string') return ticket.reportType;
  if (ticket.reportType && typeof ticket.reportType === 'object') {
    return ticket.reportType.name || ticket.reportType.type || '—';
  }
  if (ticket.isOtherReportType) return 'Other';
  return '—';
}

export function getSupportReportTypeLabel(reportType: SupportReportType): string {
  return reportType.name || reportType.type || reportType.label || '—';
}

export const useGetSupportReportTypes = () =>
  useQuery({
    queryKey: supportKeys.reportTypes(),
    queryFn: async () => {
      const response = await axiosInstance.get(
        EndPoints.SUPPORT_TICKET_REPORT_TYPES,
      );
      return unwrapReportTypes(response.data);
    },
    staleTime: 5 * 60 * 1000,
  });

export const useGetSupportTickets = (params: SupportTicketListParams) =>
  useQuery({
    queryKey: supportKeys.list(params),
    queryFn: async () => {
      const response = await axiosInstance.get(EndPoints.SUPPORT_TICKETS, {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(toApiStatusFilter(params.status)
            ? { status: toApiStatusFilter(params.status) }
            : {}),
        },
      });
      return {
        tickets: unwrapList(response.data),
        pagination: extractSupportTicketPagination(response.data),
        raw: response.data,
      };
    },
  });

export const useGetSupportTicketDetail = (ticketId: string) =>
  useQuery({
    queryKey: supportKeys.detail(ticketId),
    queryFn: async () => {
      const response = await axiosInstance.get(
        EndPoints.SUPPORT_TICKET_DETAIL(ticketId),
      );
      return unwrapDetail(response.data);
    },
    enabled: Boolean(ticketId),
  });

export const useCreateSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSupportTicketInput) => {
      const formData = new FormData();
      formData.append('title', input.title.trim());
      formData.append('description', input.description.trim());
      formData.append('priority', input.priority);

      if (input.isOtherReportType) {
        formData.append('isOtherReportType', 'true');
      } else if (input.reportTypeId) {
        formData.append('reportTypeId', input.reportTypeId);
      }

      (input.attachments ?? []).forEach(file => {
        formData.append(
          'attachments',
          buildFormDataFile(file) as any,
        );
      });
      console.log("formData----------", formData);

      const response = await axiosInstance.post(
        EndPoints.SUPPORT_TICKETS,
        formData,
        {
          headers: {
            Accept: 'application/json',
          },
          transformRequest: data => data,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportKeys.all });
    },
    onError: (error: any) => {
      console.log("error----------", error);
    },
  });
};
