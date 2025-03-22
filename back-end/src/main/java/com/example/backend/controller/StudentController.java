package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.student.StudentRequest;
import com.example.backend.entities.Student;
import com.example.backend.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@Tag(name = "Students", description = "Student management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {
    private final StudentService studentService;

    @Operation(summary = "Get all students")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Student>>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.success(studentService.findAll()));
    }

    @Operation(summary = "Get student by ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<Student>> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.findById(id)));
    }

    @Operation(summary = "Get student with details")
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<Student>> getStudentWithDetails(@PathVariable Long id) {
        Optional<Student> student = studentService.findByIdWithDetails(id);
        return student.map(s -> ResponseEntity.ok(ApiResponse.success(s)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new student")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Student>> createStudent(@Valid @RequestBody StudentRequest studentRequest) {
        Student student = new Student();
        student.setFirstName(studentRequest.getFirstName());
        student.setLastName(studentRequest.getLastName());
        student.setDateOfBirth(studentRequest.getDateOfBirth());
        student.setStudentId(generateStudentId(studentRequest.getFirstName(), studentRequest.getLastName()));
        student.setSeatNumber(1); 
        student.setGrade(studentRequest.getGrade());
        student.setActive(true);
        
        return ResponseEntity.ok(ApiResponse.success(studentService.save(student)));
    }

    @Operation(summary = "Update a student")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Student>> updateStudent(
            @PathVariable Long id, 
            @Valid @RequestBody StudentRequest studentRequest) {
        Student student = studentService.findById(id);
        student.setFirstName(studentRequest.getFirstName());
        student.setLastName(studentRequest.getLastName());
        student.setDateOfBirth(studentRequest.getDateOfBirth());
        student.setGrade(studentRequest.getGrade());
        
        return ResponseEntity.ok(ApiResponse.success(studentService.save(student)));
    }

    @Operation(summary = "Delete a student")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.softDeleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Find students by school ID")
    @GetMapping("/school/{schoolId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Student>>> findBySchoolId(@PathVariable Long schoolId) {
        return ResponseEntity.ok(ApiResponse.success(studentService.findBySchoolId(schoolId)));
    }

    @Operation(summary = "Find students by parent ID")
    @GetMapping("/parent/{parentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<List<Student>>> findByParentId(@PathVariable Long parentId) {
        return ResponseEntity.ok(ApiResponse.success(studentService.findByParentId(parentId)));
    }

    @Operation(summary = "Find student by student ID")
    @GetMapping("/student-id/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Student>> findByStudentId(@PathVariable String studentId) {
        Optional<Student> student = studentService.findByStudentId(studentId);
        return student.map(s -> ResponseEntity.ok(ApiResponse.success(s)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Find student by QR code")
    @GetMapping("/qr-code/{qrCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<Student>> findByQrCode(@PathVariable String qrCode) {
        Optional<Student> student = studentService.findByQrCode(qrCode);
        return student.map(s -> ResponseEntity.ok(ApiResponse.success(s)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Search students")
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Student>>> searchStudents(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(studentService.searchStudents(query)));
    }

    @Operation(summary = "Assign student to school")
    @PutMapping("/{studentId}/assign-school/{schoolId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> assignToSchool(
            @PathVariable Long studentId,
            @PathVariable Long schoolId) {
        studentService.assignToSchool(studentId, schoolId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Assign student to parent")
    @PutMapping("/{studentId}/assign-parent/{parentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> assignToParent(
            @PathVariable Long studentId,
            @PathVariable Long parentId) {
        studentService.assignToParent(studentId, parentId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Remove student from school")
    @PutMapping("/{studentId}/remove-school")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeFromSchool(@PathVariable Long studentId) {
        studentService.removeFromSchool(studentId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Remove student from parent")
    @PutMapping("/{studentId}/remove-parent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeFromParent(@PathVariable Long studentId) {
        studentService.removeFromParent(studentId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Generate QR code for student")
    @PutMapping("/{studentId}/generate-qr-code")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> generateQrCode(@PathVariable Long studentId) {
        studentService.generateQrCode(studentId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Update student details")
    @PutMapping("/{studentId}/details")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStudentDetails(
            @PathVariable Long studentId,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam String grade) {
        studentService.updateStudentDetails(studentId, firstName, lastName, grade);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Operation(summary = "Find students with attendance stats")
    @GetMapping("/school/{schoolId}/attendance-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Student>>> findStudentsWithAttendanceStats(
            @PathVariable Long schoolId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(studentService.findStudentsWithAttendanceStats(schoolId, start, end)));
    }

    @Operation(summary = "Count absences for student")
    @GetMapping("/{studentId}/absences/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<Long>> countAbsences(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(studentService.countAbsences(studentId, start, end)));
    }

    @Operation(summary = "Calculate attendance percentage for student")
    @GetMapping("/{studentId}/attendance/percentage")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<Double>> calculateAttendancePercentage(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(ApiResponse.success(studentService.calculateAttendancePercentage(studentId, start, end)));
    }

    @Operation(summary = "Find students by route")
    @GetMapping("/route/{routeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<ApiResponse<List<Student>>> findStudentsByRoute(@PathVariable Long routeId) {
        return ResponseEntity.ok(ApiResponse.success(studentService.findStudentsByRoute(routeId)));
    }
    
    /**
     * Helper method to generate a student ID
     */
    private String generateStudentId(String firstName, String lastName) {
        String initials = firstName.substring(0, 1) + lastName.substring(0, 1);
        return initials.toUpperCase() + "-" + System.currentTimeMillis() % 10000;
    }
} 