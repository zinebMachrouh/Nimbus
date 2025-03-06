package com.nimbus.service;

import com.nimbus.dto.StudentDTO;
import com.nimbus.dto.request.CreateStudentRequest;
import com.nimbus.dto.request.UpdateStudentRequest;

import java.util.List;

public interface StudentService {
    List<StudentDTO> getAllStudents();
    StudentDTO getStudentById(Long id);
    List<StudentDTO> getStudentsByParentId(Long parentId);
    StudentDTO createStudent(CreateStudentRequest createStudentRequest);
    StudentDTO updateStudent(Long id, UpdateStudentRequest updateStudentRequest);
    void activateStudent(Long id);
    void deactivateStudent(Long id);
    StudentDTO getStudentByQrCode(String qrCode);
}

