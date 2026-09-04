package com.project.platform.config;

import com.project.platform.entity.*;
import com.project.platform.entity.enums.*;
import com.project.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class AdminSeeder {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final ProjectProgressRepository projectProgressRepository;
    private final AnnouncementRepository announcementRepository;
    private final TeamMemberReviewRepository teamMemberReviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.seed-email:admin@projecthub.local}")
    private String adminEmail;

    @Value("${app.admin.seed-password:Admin@12345}")
    private String adminPassword;

    @Value("${app.admin.seed-name:Platform Administrator}")
    private String adminName;

    @Bean
    CommandLineRunner seedAdmin() {
        return args -> {
            User admin = userRepository.findByEmail(adminEmail).orElse(null);
            if (admin == null) {
                admin = User.builder()
                    .name(adminName)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .accountStatus(AccountStatus.ACTIVE)
                    .build();
                admin = userRepository.save(admin);
            } else if (admin.getRole() != Role.ADMIN) {
                admin.setRole(Role.ADMIN);
                admin.setAccountStatus(AccountStatus.ACTIVE);
                admin = userRepository.save(admin);
            }

            // Seed sample data if only admin (or no other users) exist
            if (userRepository.count() <= 1) {
                // Students
                User s1 = userRepository.save(User.builder().name("Ananya Menon").email("ananya@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
                User s2 = userRepository.save(User.builder().name("Rahul Krishnan").email("rahul@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
                User s3 = userRepository.save(User.builder().name("Arjun Das").email("arjun@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());

                studentProfileRepository.save(StudentProfile.builder().userId(s1.getId()).department("CSE").skills("Java, React, MySQL").bio("Passionate full-stack developer.").build());
                studentProfileRepository.save(StudentProfile.builder().userId(s2.getId()).department("ECE").skills("Python, IoT, C++").bio("Hardware and embedded systems enthusiast.").build());
                studentProfileRepository.save(StudentProfile.builder().userId(s3.getId()).department("IT").skills("Node.js, Docker, MongoDB").bio("Backend & cloud architecture focus.").build());

                // Faculty
                User f1 = userRepository.save(User.builder().name("Dr. Meera Nair").email("meera@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());
                User f2 = userRepository.save(User.builder().name("Dr. Joseph Mathew").email("joseph@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());

                facultyProfileRepository.save(FacultyProfile.builder().userId(f1.getId()).department("CSE").designation("Professor").specialization("Machine Learning & Software Engineering").build());
                facultyProfileRepository.save(FacultyProfile.builder().userId(f2.getId()).department("ECE").designation("Associate Professor").specialization("Embedded Systems & Robotics").build());

                // Projects
                Project p1 = projectRepository.save(Project.builder().title("Campus Smart Parking").description("IoT and AI-based real-time parking spot reservation system.").requiredSkills("Java, Spring Boot, React").status(ProjectStatus.IN_PROGRESS).createdBy(s1.getId()).build());
                Project p2 = projectRepository.save(Project.builder().title("AI Study Planner").description("Smart calendar application generating personalized study routines.").requiredSkills("Python, React, FastApi").status(ProjectStatus.OPEN).createdBy(s2.getId()).build());
                Project p3 = projectRepository.save(Project.builder().title("IoT Lab Monitor").description("Sensors monitoring temperature and energy usage in engineering labs.").requiredSkills("C++, Microcontrollers, MQTT").status(ProjectStatus.IN_PROGRESS).createdBy(s3.getId()).build());
                Project p4 = projectRepository.save(Project.builder().title("Student Event Hub").description("Centralized university events portal with ticketing and RSVP.").requiredSkills("Java, MySQL, React").status(ProjectStatus.COMPLETED).createdBy(s1.getId()).build());

                // Members
                projectMemberRepository.save(ProjectMember.builder().projectId(p1.getId()).studentId(s1.getId()).role(ProjectMemberRole.LEADER).build());
                projectMemberRepository.save(ProjectMember.builder().projectId(p1.getId()).studentId(s2.getId()).role(ProjectMemberRole.MEMBER).build());
                projectMemberRepository.save(ProjectMember.builder().projectId(p2.getId()).studentId(s2.getId()).role(ProjectMemberRole.LEADER).build());
                projectMemberRepository.save(ProjectMember.builder().projectId(p3.getId()).studentId(s3.getId()).role(ProjectMemberRole.LEADER).build());
                projectMemberRepository.save(ProjectMember.builder().projectId(p4.getId()).studentId(s1.getId()).role(ProjectMemberRole.LEADER).build());
                projectMemberRepository.save(ProjectMember.builder().projectId(p4.getId()).studentId(s3.getId()).role(ProjectMemberRole.MEMBER).build());

                // Tasks (p3 has an overdue task to trigger delayed/inactive detection!)
                taskRepository.save(Task.builder().projectId(p1.getId()).assignedTo(s1.getId()).title("Database Schema Design").description("Entity relationships for parking slots").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(5)).build());
                taskRepository.save(Task.builder().projectId(p1.getId()).assignedTo(s2.getId()).title("Sensor Data API").description("REST endpoints for hardware data").status(TaskStatus.IN_PROGRESS).progress(60).dueDate(LocalDateTime.now().plusDays(3)).build());
                taskRepository.save(Task.builder().projectId(p3.getId()).assignedTo(s3.getId()).title("MQTT Gateway Integration").description("Connect hardware sensors to cloud").status(TaskStatus.TODO).progress(10).dueDate(LocalDateTime.now().minusDays(10)).build());

                // Project Progress (p3 stale last activity)
                projectProgressRepository.save(ProjectProgress.builder().projectId(p1.getId()).overallProgress(68).lastActivityAt(LocalDateTime.now().minusDays(1)).build());
                projectProgressRepository.save(ProjectProgress.builder().projectId(p2.getId()).overallProgress(25).lastActivityAt(LocalDateTime.now().minusDays(2)).build());
                projectProgressRepository.save(ProjectProgress.builder().projectId(p3.getId()).overallProgress(35).lastActivityAt(LocalDateTime.now().minusDays(14)).build());
                projectProgressRepository.save(ProjectProgress.builder().projectId(p4.getId()).overallProgress(100).lastActivityAt(LocalDateTime.now().minusDays(7)).build());

                // Announcements
                announcementRepository.save(Announcement.builder().title("Project Evaluation Week Announced").content("Faculty evaluations will open next Monday. All teams must submit progress reports.").scope(AnnouncementScope.ALL).createdBy(admin.getId()).build());

                // Reviews
                teamMemberReviewRepository.save(TeamMemberReview.builder().projectId(p1.getId()).reviewerId(s1.getId()).revieweeId(s2.getId()).rating(4).comments("Strong technical contribution and consistent communication.").build());
                teamMemberReviewRepository.save(TeamMemberReview.builder().projectId(p4.getId()).reviewerId(s1.getId()).revieweeId(s3.getId()).rating(5).comments("Excellent ownership of the backend integration.").build());
            }
        };
    }
}

