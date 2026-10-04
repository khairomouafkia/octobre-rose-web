import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '../service/apiService';
import { queryKeys } from '../query/queryClient';

// ================= مواعيد الفحص =================

export function useScreenings(userId: string) {
  return useQuery({
    queryKey: queryKeys.screenings(userId),
    queryFn: () => ApiService.getScreenings(userId),
    enabled: userId.length > 0,
  });
}

export function useAddScreening(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ApiService.addScreening,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.screenings(userId) }),
  });
}

export function useUpdateScreening(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { screeningType?: string; scheduledDate?: string; notes?: string } }) =>
      ApiService.updateScreening(id, updates),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.screenings(userId) }),
  });
}

export function useDeleteScreening(userId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ApiService.deleteScreening,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.screenings(userId) }),
  });
}

// ================= مراكز الفحص =================

export function useCenters() {
  return useQuery({ queryKey: queryKeys.centers, queryFn: ApiService.getScreeningCenters });
}

export function useCreateCenter() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ApiService.createCenter,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.centers }),
  });
}

export function useUpdateCenter() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      ApiService.updateCenter(id, updates),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.centers }),
  });
}

export function useDeleteCenter() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ApiService.deleteCenter,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.centers }),
  });
}

// ================= الفعاليات =================

export function useEvents() {
  return useQuery({ queryKey: queryKeys.events, queryFn: ApiService.getEvents });
}

export function useMyEventRegistrations(userId: string) {
  return useQuery({
    queryKey: queryKeys.eventRegistrations(userId),
    queryFn: ApiService.getMyEventRegistrations,
    enabled: userId.length > 0,
  });
}

export function useRegisterForEvent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ApiService.registerForEvent,
    onSuccess: () => client.invalidateQueries({ queryKey: ['event-registrations'] }),
  });
}

export function useCancelEventRegistration() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ApiService.cancelEventRegistration,
    onSuccess: () => client.invalidateQueries({ queryKey: ['event-registrations'] }),
  });
}

export function useCreateEvent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ApiService.createEvent,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.events }),
  });
}

export function useUpdateEvent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      ApiService.updateEvent(id, updates),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.events }),
  });
}

export function useDeleteEvent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ApiService.deleteEvent,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.events }),
  });
}

// ================= مجتمع الدعم =================

export function useCommunityPosts() {
  return useQuery({ queryKey: queryKeys.communityPosts, queryFn: ApiService.getCommunityPosts });
}

export function useCreatePost() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ApiService.createPost,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.communityPosts }),
  });
}

export function useDeletePost() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ApiService.deleteCommunityPost,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.communityPosts }),
  });
}
