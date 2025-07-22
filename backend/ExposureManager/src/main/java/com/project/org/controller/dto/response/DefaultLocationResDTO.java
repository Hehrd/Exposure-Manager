package com.project.org.controller.dto.response;

import lombok.Data;

@Data
public class DefaultLocationResDTO {
    private Long id;
    private String name;
    private String address;
    private String country;
    private String city;
    private Integer zipCode;
    private Long accountId;
}
