package com.project.org.controller.dto.request.location;

import com.project.org.controller.dto.request.ReqDTO;
import lombok.Data;

@Data
public class LocationUpdateReqDTO implements ReqDTO {
    private Long id;
    private String name;
    private String address;
    private String country;
    private String city;
    private Integer zipCode;
    private Long accountId;
}
