package com.nimbus.service.impl;

import com.nimbus.dto.StudentDTO;
import com.nimbus.dto.request.CreateStudentRequest;
import com.nimbus.dto.request.UpdateStudentRequest;
import com.nimbus.exception.ResourceNotFoundException;
import com.nimbus.mapper.StudentMapper;
import com.nimbus.model.Parent;
import com.nimbus.model.Route;
import com.nimbus.model.Student;
import com.nimbus.repository.ParentRepository;
import com.nimbus.repository.RouteRepository;
import com.nimbus.repository.StudentRepository;
import com.nimbus.service.StudentService;
import com.nimbus.util.QRCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {
    
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final RouteRepository routeRepository;
    private final StudentMapper studentMapper;
    private final QRCodeGenerator qrCodeGenerator;
    
    @Override
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(studentMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return studentMapper.toDTO(student);
    }
    
    @Override
    public List<StudentDTO> getStudentsByParentId(Long parentId) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + parentId));
        
        return studentRepository.findByParent(parent).stream()
                .map(studentMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public StudentDTO createStudent(CreateStudentRequest createStudentRequest) {
        Parent parent = parentRepository.findById(createStudentRequest.getParentId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + createStudentRequest.getParentId()));
        
        Student student = new Student();
        student.setFullName(createStudentRequest.getFirstName());
        student.setParent(parent);
        student.setActive(true);
        
        // Generate unique QR code
        String qrCode = qrCodeGenerator.generateStudentQRCode();
        student.setQrCode(qrCode);
        
        if (createStudentRequest.getRouteId() != null) {
            Route route = routeRepository.findById(createStudentRequest.getRouteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + createStudentRequest.getRouteId()));
            student.setRoute(route);
        }
        
        if (createStudentRequest.getSeatNumber() != null) {
            student.setSeatNumber(createStudentRequest.getSeatNumber());
        }
        
        Student savedStudent = studentRepository.save(student);
        return studentMapper.toDTO(savedStudent);
    }
    
    @Override
    @Transactional
    public StudentDTO updateStudent(Long id, UpdateStudentRequest updateStudentRequest) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        
        if (updateStudentRequest.getParentId() != null) {
            Parent parent = parentRepository.findById(updateStudentRequest.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent not found with id: " + updateStudentRequest.getParentId()));
            student.setParent(parent);
        }
        
        if (updateStudentRequest.getRouteId() != null) {
            Route route = routeRepository.findById(updateStudentRequest.getRouteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + updateStudentRequest.getRouteId()));
            student.setRoute(route);
        } else if (updateStudentRequest.getRouteId() == null && updateStudentRequest.isRouteIdPresent()) {
            student.setRoute(null);
        }
        
        studentMapper.updateStudentFromRequest(updateStudentRequest, student);
        Student updatedStudent = studentRepository.save(student);
        return studentMapper.toDTO(updatedStudent);
    }
    
    @Override
    @Transactional
    public void activateStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        student.setActive(true);
        studentRepository.save(student);
    }
    
    @Override
    @Transactional
    public void deactivateStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        student.setActive(false);
        studentRepository.save(student);
    }
    
    @Override
    public StudentDTO getStudentByQrCode(String qrCode) {
        Student student = studentRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with QR code: " + qrCode));
        return studentMapper.toDTO(student);
    }
}

