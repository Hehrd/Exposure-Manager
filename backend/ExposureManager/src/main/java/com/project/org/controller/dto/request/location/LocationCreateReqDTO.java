package com.project.org.controller.dto.request.location;

import lombok.Data;

@Data
public class LocationCreateReqDTO {
    private String name;
    private String address;
    private String country;
    private String city;
    private Integer zipCode;
    private Long accountId;
}
