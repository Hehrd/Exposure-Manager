package com.project.org.controller.dto.request.portfolio;

import com.project.org.controller.dto.request.ReqDTO;
import lombok.Data;

@Data
public class PortfolioUpdateReqDTO implements ReqDTO {
    private Long id;
    private String name;
    private String databaseName;
}
