import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { axiosPrivate } from "@/lib/axios.private";
import { directorStudentManageService } from "@/services/director-service/student-manage.service";
import { GetAllStudentsService } from "@/services/all-students.service";

// Hook: Get Students by Procare Classroom ID
export const useGetStudentsByProcareClassroom = (classroomId) => {
  const axiosInstance = axiosPrivate();

  return useQuery({
    queryKey: ["procare-students-by-classroom", classroomId],
    queryFn: () => GetAllStudentsService.getAllStudents(axiosInstance, { classroom_id: classroomId, per_page: 200 }),
    enabled: !!classroomId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook: Get Student Data by Tab Type (enrollment, incidents, removals, at_risk)
export const useGetStudentDataByType = (params = { type: "enrollment", page: 1, per_page: 10 }) => {
  const axiosInstance = axiosPrivate();

  return useQuery({
    queryKey: ["director-students-by-type", params.type, params.page, params.per_page],
    queryFn: () => directorStudentManageService.getStudentDataByType(axiosInstance, params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook: Get Students by Classroom (Single Query)
export const useGetStudentsByClass = (params = { id: null }) => {
  const axiosInstance = axiosPrivate();

  return useQuery({
    queryKey: ["director-students-by-class", params?.id],
    queryFn: () => directorStudentManageService.getStudentsByClass(axiosInstance, params),
    enabled: !!params?.id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook: Get Students by Classroom (Infinite Scroll)
export const useInfiniteStudentsByClass = (params = { id: null, per_page: 10 }) => {
  const axiosInstance = axiosPrivate();

  return useInfiniteQuery({
    queryKey: ["director-students-by-class", params?.id],
    queryFn: ({ pageParam = 1 }) =>
      directorStudentManageService.getStudentsByClass(axiosInstance, { ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination;
      if (!pagination) return undefined;
      const current = Number(pagination.current_page);
      const last = Number(pagination.last_page);
      return current < last ? current + 1 : undefined;
    },
    enabled: !!params?.id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook: Get Single Student Enrollment Detail
export const useGetSingleStudent = (id) => {
  const axiosInstance = axiosPrivate();

  return useQuery({
    queryKey: ["director-single-student", id],
    queryFn: () => directorStudentManageService.getSingleStudent(axiosInstance, { id }),
    enabled: !!id,
  });
};

// Mutation: Enroll Student
export const useEnrollStudent = () => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => directorStudentManageService.enrollStudentByClass(axiosInstance, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["director-students-by-type"] });
      queryClient.invalidateQueries({ queryKey: ["all-classrooms"] });
    },
  });
};

// Mutation: Update Student
export const useUpdateStudent = () => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => directorStudentManageService.updateStudentByClass(axiosInstance, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["director-students-by-type"] });
      queryClient.invalidateQueries({ queryKey: ["director-single-student"] });
      queryClient.invalidateQueries({ queryKey: ["director-students-by-class"] });
    },
  });
};

// Mutation: Log Incident
export const useLogIncident = () => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => directorStudentManageService.logIncidents(axiosInstance, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["director-students-by-type"] });
    },
  });
};

// Mutation: Edit Incident
export const useEditIncident = () => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => directorStudentManageService.editIncident(axiosInstance, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["director-students-by-type"] });
    },
  });
};

// Mutation: Delete Incident
export const useDeleteIncident = () => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => directorStudentManageService.deleteIncident(axiosInstance, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["director-students-by-type"] });
    },
  });
};

// Mutation: Add Removal Student
export const useAddRemovalStudent = () => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => directorStudentManageService.addRemovalStudent(axiosInstance, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["director-students-by-type"] });
    },
  });
};

// Mutation: Add At-Risk Student
export const useAddAtRiskStudent = () => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => directorStudentManageService.addAtRiskStudent(axiosInstance, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["director-students-by-type"] });
    },
  });
};

// Mutation: Update At-Risk Student
export const useUpdateAtRiskStudent = () => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => directorStudentManageService.updateAtRiskStudent(axiosInstance, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["director-students-by-type"] });
    },
  });
};

// Mutation: Withdraw At-Risk Student
export const useWithdrawAtRisk = () => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => directorStudentManageService.withdrawAtRisk(axiosInstance, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["director-students-by-type"] });
      queryClient.invalidateQueries({ queryKey: ["owner-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
      queryClient.invalidateQueries({ queryKey: ["director-at-risk"] });
    },
  });
};

// Mutation: Retain At-Risk Student
export const useRetainAtRisk = () => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => directorStudentManageService.retainAtRisk(axiosInstance, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["director-students-by-type"] });
      queryClient.invalidateQueries({ queryKey: ["owner-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
      queryClient.invalidateQueries({ queryKey: ["director-at-risk"] });
    },
  });
};

// Mutation: Withdraw Student from Class
export const useWithdrawFromClass = () => {
  const axiosInstance = axiosPrivate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => directorStudentManageService.withdrawFromClass(axiosInstance, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["director-students-by-class"] });
      queryClient.invalidateQueries({ queryKey: ["director-students-by-type"] });
      queryClient.invalidateQueries({ queryKey: ["procare-students-by-classroom"] });
    },
  });
};
