package com.nimbus.security;

import com.nimbus.model.Attendance;
import com.nimbus.model.Student;
import com.nimbus.repository.AttendanceRepository;
import com.nimbus.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("userSecurity")
public class UserSecurity {
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    public boolean isCurrentUser(Long userId, Authentication authentication) {
        String username = authentication.getName();
        return username.equals(userId.toString());
    }
    
    public boolean isParentOfStudent(Long studentId, Authentication authentication) {
        String username = authentication.getName();
        Optional<Student> student = studentRepository.findById(studentId);
        
        if (student.isPresent() && student.get().getParent() != null) {
            return student.get().getParent().getUsername().equals(username);
        }
        
        return false;
    }
    
    public boolean canAccessAttendance(Long attendanceId, Authentication authentication) {
        String username = authentication.getName();
        Optional<Attendance> attendance = attendanceRepository.findById(attendanceId);
        
        if (attendance.isPresent() && attendance.get().getStudent() != null 
                && attendance.get().getStudent().getParent() != null) {
            return attendance.get().getStudent().getParent().getUsername().equals(username);
        }
        
        return false;
    }
}

