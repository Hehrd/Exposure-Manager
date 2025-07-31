package com.project.org.persistence.entity.util.converter;

import com.project.org.persistence.entity.enums.JobStatus;
import com.project.org.persistence.entity.enums.Role;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class JobStatusConverter implements AttributeConverter<JobStatus, String> {

    @Override
    public String convertToDatabaseColumn(JobStatus jobStatus) {
        return jobStatus == null ? null : jobStatus.toString();
    }

    @Override
    public JobStatus convertToEntityAttribute(String text) {
        return JobStatus.getJobStatusByText(text);
    }
}
