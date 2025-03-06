package com.nimbus.controller;

import com.nimbus.dto.StudentDTO;
import com.nimbus.dto.request.CreateStudentRequest;
import com.nimbus.dto.request.UpdateStudentRequest;
import com.nimbus.dto.response.MessageResponse;
import com.nimbus.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/students")
public class StudentController {
    
    @Autowired
    private StudentService studentService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER')")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        List<StudentDTO> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER') or @userSecurity.isParentOfStudent(#id, authentication)")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        StudentDTO student = studentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }
    
    @GetMapping("/parent/{parentId}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#parentId, authentication)")
    public ResponseEntity<List<StudentDTO>> getStudentsByParentId(@PathVariable Long parentId) {
        List<StudentDTO> students = studentService.getStudentsByParentId(parentId);
        return ResponseEntity.ok(students);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARENT')")
    public ResponseEntity<StudentDTO> createStudent(@Valid @RequestBody CreateStudentRequest createStudentRequest) {
        StudentDTO createdStudent = studentService.createStudent(createStudentRequest);
        return ResponseEntity.ok(createdStudent);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isParentOfStudent(#id, authentication)")
    public ResponseEntity<StudentDTO> updateStudent(@PathVariable Long id, @Valid @RequestBody UpdateStudentRequest updateStudentRequest) {
        StudentDTO updatedStudent = studentService.updateStudent(id, updateStudentRequest);
        return ResponseEntity.ok(updatedStudent);
    }
    
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activateStudent(@PathVariable Long id) {
        studentService.activateStudent(id);
        return ResponseEntity.ok(new MessageResponse("Student activated successfully"));
    }
    
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateStudent(@PathVariable Long id) {
        studentService.deactivateStudent(id);
        return ResponseEntity.ok(new MessageResponse("Student deactivated successfully"));
    }
    
    @GetMapping("/qr/{qrCode}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DRIVER')")
    public ResponseEntity<StudentDTO> getStudentByQrCode(@PathVariable String qrCode) {
        StudentDTO student = studentService.getStudentByQrCode(qrCode);
        return ResponseEntity.ok(student);
    }
}

