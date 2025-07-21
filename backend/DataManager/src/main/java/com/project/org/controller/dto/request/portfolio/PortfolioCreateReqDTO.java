package com.project.org.controller.dto.request.portfolio;

import com.project.org.controller.dto.request.ReqDTO;
import lombok.Data;


@Data
public class PortfolioCreateReqDTO implements ReqDTO {
    private String name;
}
