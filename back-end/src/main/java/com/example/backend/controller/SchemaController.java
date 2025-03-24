package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/schema")
@RequiredArgsConstructor
@Tag(name = "Schema", description = "API schema endpoints")
@SecurityRequirement(name = "bearerAuth")
public class SchemaController {

    @Operation(summary = "Get trip request schema")
    @GetMapping("/trip-request")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTripRequestSchema() {
        Map<String, Object> schema = new HashMap<>();
        
        // Define the schema structure
        Map<String, Object> properties = new HashMap<>();
        
        // Required fields
        properties.put("routeId", Map.of(
            "type", "number",
            "description", "ID of the route for this trip",
            "required", true
        ));
        
        properties.put("driverId", Map.of(
            "type", "number",
            "description", "ID of the driver assigned to this trip",
            "required", true
        ));
        
        properties.put("vehicleId", Map.of(
            "type", "number",
            "description", "ID of the vehicle assigned to this trip",
            "required", true
        ));
        
        properties.put("scheduledDepartureTime", Map.of(
            "type", "string",
            "format", "date-time",
            "description", "Scheduled departure time for the trip",
            "required", true
        ));
        
        properties.put("scheduledArrivalTime", Map.of(
            "type", "string",
            "format", "date-time",
            "description", "Scheduled arrival time for the trip",
            "required", true
        ));
        
        properties.put("notes", Map.of(
            "type", "string",
            "description", "Additional notes about the trip",
            "required", false
        ));
        
        properties.put("status", Map.of(
            "type", "string",
            "enum", new String[]{"SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"},
            "description", "Current status of the trip",
            "required", false,
            "default", "SCHEDULED"
        ));
        
        schema.put("type", "object");
        schema.put("properties", properties);
        schema.put("required", new String[]{"routeId", "driverId", "vehicleId", "scheduledDepartureTime", "scheduledArrivalTime"});
        
        return ResponseEntity.ok(ApiResponse.success(schema));
    }
} 