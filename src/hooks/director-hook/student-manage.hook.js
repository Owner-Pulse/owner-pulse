import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosPrivate } from "@/lib/axios.private";
import { directorStudentManageService } from "@/services/director-service/student-manage.service";

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

// Hook: Get Students by Classroom
export const useGetStudentsByClass = (params = { id: null }) => {
  const axiosInstance = axiosPrivate();

  return useQuery({
    queryKey: ["director-students-by-class", params?.id],
    queryFn: () => directorStudentManageService.getStudentsByClass(axiosInstance, params),
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
    },
  });
};
