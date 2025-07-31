package com.project.org.service;

import com.project.org.controller.dto.request.job.JobCreateReqDTO;
import com.project.org.controller.dto.request.job.JobFinishDTO;
import com.project.org.controller.dto.response.DefaultJobResDTO;
import com.project.org.controller.dto.response.PagedResponse;
import com.project.org.error.exception.NotFoundException;
import com.project.org.persistence.entity.JobEntity;
import com.project.org.persistence.entity.UserEntity;
import com.project.org.persistence.entity.enums.JobStatus;
import com.project.org.persistence.repository.JobRepository;
import com.project.org.persistence.repository.UserRepository;
import com.project.org.security.JwtUser;
import com.project.org.util.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class JobService {
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final JwtService jwtService;

    @Autowired
    JobService(UserRepository userRepository, JobRepository jobRepository, JwtService jwtService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    public PagedResponse<DefaultJobResDTO> getJobs(int page, int size, String jwt) {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        Pageable pageable = PageRequest.of(page, size);
        Page<JobEntity> jobEntityPage = jobRepository.findAllByOwner_Id(jwtUser.getId(), pageable);
        List<DefaultJobResDTO> jobResDTOs = new ArrayList<>();
        for (JobEntity jobEntity : jobEntityPage) {
            DefaultJobResDTO defaultJobResDTO = ObjectMapper.toDTO(jobEntity);
            jobResDTOs.add(defaultJobResDTO);
        }
        PagedResponse<DefaultJobResDTO> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(jobResDTOs);
        pagedResponse.setTotalElements(jobEntityPage.getTotalElements());
        pagedResponse.setPageNumber(page);
        pagedResponse.setPageSize(size);
        return pagedResponse;
    }

    public Long startJob(JobCreateReqDTO reqDTO, String jwt) throws NotFoundException {
        JwtUser jwtUser = jwtService.extractUser(jwt);
        JobEntity jobEntity = ObjectMapper.toEntity(reqDTO);
        UserEntity userEntity = userRepository.findById(jwtUser.getId())
                .orElseThrow(() -> new NotFoundException("User not found"));
        jobEntity.setOwner(userEntity);
        jobEntity.setTimeStartedMillis(reqDTO.getTimeStartedMillis());
        jobEntity.setStatus(JobStatus.IN_PROGRESS);
        jobRepository.save(jobEntity);
        return jobEntity.getId();
    }

    public void finishJob(JobFinishDTO reqDTO) throws NotFoundException {
        JobEntity jobEntity = jobRepository.findById(reqDTO.getId())
                .orElseThrow(() -> new NotFoundException("Job not found"));
        jobEntity.setTimeFinishedMillis(reqDTO.getTimeFinishedMillis());
        jobEntity.setStatus(reqDTO.getStatus());
        jobRepository.save(jobEntity);
    }

}
