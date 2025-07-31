package com.project.org.controller;

import com.project.org.controller.dto.request.job.JobCreateReqDTO;
import com.project.org.controller.dto.request.job.JobFinishDTO;
import com.project.org.controller.dto.response.DefaultJobResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.NotFoundException;
import com.project.org.service.JobService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jobs")
@Validated
public class JobController {
    private final JobService jobService;

    @Autowired
    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping("")
    public ResponseEntity<PagedResponse<DefaultJobResDTO>> getJobs(
            @RequestParam("page") @NotNull Integer page,
            @RequestParam("size") @NotNull Integer size,
            @CookieValue("access_token") @NotBlank String jwt) {

        PagedResponse<DefaultJobResDTO> pagedResponse = jobService.getJobs(page, size, jwt);
        return ResponseEntity.status(HttpStatus.OK).body(pagedResponse);
    }

    @PostMapping("")
    public ResponseEntity<Void> finishJob(
            @Valid @RequestBody JobFinishDTO job)
            throws NotFoundException {

        jobService.finishJob(job);
        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
