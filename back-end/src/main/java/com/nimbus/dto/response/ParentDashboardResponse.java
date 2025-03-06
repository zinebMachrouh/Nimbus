package com.nimbus.dto.response;

import com.nimbus.model.Parent;
import com.nimbus.model.Student;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ParentDashboardResponse {
    private Parent parent;
    private List<Student> students;
    private Map<Long, Map<String, Object>> activeTrips;
}

