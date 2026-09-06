package com.project.platform.config;

import com.project.platform.entity.*;
import com.project.platform.entity.enums.*;
import com.project.platform.repository.*;
import lombok.RequiredArgsConstructor;
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
    private final FileResourceRepository fileResourceRepository;
    private final MessageRepository messageRepository;
    private final AnnouncementRepository announcementRepository;
    private final TeamMemberReviewRepository teamMemberReviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedSampleData() {
        return args -> {
            // Seed initial sample students, faculty, admin if database has zero users
            if (userRepository.count() == 0) {
                // Admin
                userRepository.save(User.builder().name("System Admin").email("admin@college.edu").password(passwordEncoder.encode("Admin@123")).role(Role.ADMIN).accountStatus(AccountStatus.ACTIVE).build());

                // Students
                User s1 = userRepository.save(User.builder().name("Ananya Menon").email("ananya@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
                User s2 = userRepository.save(User.builder().name("Rahul Krishnan").email("rahul@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
                User s3 = userRepository.save(User.builder().name("Arjun Das").email("arjun@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());

                studentProfileRepository.save(StudentProfile.builder().userId(s1.getId()).department("CSE").skills("Java, React, MySQL, Spring Boot").bio("Full-stack developer & project lead.").githubUrl("https://github.com/ananya-dev").build());
                studentProfileRepository.save(StudentProfile.builder().userId(s2.getId()).department("ECE").skills("Python, IoT, C++, Sensors, MQTT").bio("Hardware & embedded systems developer.").githubUrl("https://github.com/rahul-iot").build());
                studentProfileRepository.save(StudentProfile.builder().userId(s3.getId()).department("IT").skills("Node.js, Docker, MongoDB, Cloud, React").bio("Cloud architecture & backend enthusiast.").githubUrl("https://github.com/arjun-cloud").build());

                // Faculty
                User f1 = userRepository.save(User.builder().name("Dr. Meera Nair").email("meera@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());
                User f2 = userRepository.save(User.builder().name("Dr. Joseph Mathew").email("joseph@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());

                facultyProfileRepository.save(FacultyProfile.builder().userId(f1.getId()).department("CSE").designation("Professor").specialization("Machine Learning & Software Engineering").build());
                facultyProfileRepository.save(FacultyProfile.builder().userId(f2.getId()).department("ECE").designation("Associate Professor").specialization("Embedded Systems & Robotics").build());

                // Projects
                Project p1 = projectRepository.save(Project.builder().title("Campus Smart Parking").description("IoT and AI-based real-time parking spot reservation system for campus vehicles.").requiredSkills("Java, Spring Boot, React, IoT").status(ProjectStatus.IN_PROGRESS).createdBy(s1.getId()).build());
                Project p2 = projectRepository.save(Project.builder().title("AI Study Planner").description("Smart calendar application generating personalized study routines using ML algorithms.").requiredSkills("Python, React, FastAPI, ML").status(ProjectStatus.IN_PROGRESS).createdBy(s2.getId()).build());
                Project p3 = projectRepository.save(Project.builder().title("IoT Lab Monitor").description("Sensors monitoring temperature, humidity, and energy usage in university engineering laboratories.").requiredSkills("C++, Microcontrollers, MQTT, Cloud").status(ProjectStatus.IN_PROGRESS).createdBy(s3.getId()).build());
                Project p4 = projectRepository.save(Project.builder().title("Student Event Hub").description("Centralized university events portal with ticketing, RSVP, and automated notifications.").requiredSkills("Java, MySQL, React").status(ProjectStatus.COMPLETED).createdBy(s1.getId()).build());

                // Members
                projectMemberRepository.save(ProjectMember.builder().projectId(p1.getId()).studentId(s1.getId()).role(ProjectMemberRole.LEADER).build());
                projectMemberRepository.save(ProjectMember.builder().projectId(p1.getId()).studentId(s2.getId()).role(ProjectMemberRole.MEMBER).build());
                projectMemberRepository.save(ProjectMember.builder().projectId(p2.getId()).studentId(s2.getId()).role(ProjectMemberRole.LEADER).build());
                projectMemberRepository.save(ProjectMember.builder().projectId(p2.getId()).studentId(s1.getId()).role(ProjectMemberRole.MEMBER).build());
                projectMemberRepository.save(ProjectMember.builder().projectId(p3.getId()).studentId(s3.getId()).role(ProjectMemberRole.LEADER).build());
                projectMemberRepository.save(ProjectMember.builder().projectId(p4.getId()).studentId(s1.getId()).role(ProjectMemberRole.LEADER).build());
                projectMemberRepository.save(ProjectMember.builder().projectId(p4.getId()).studentId(s3.getId()).role(ProjectMemberRole.MEMBER).build());

                // Tasks - Project 1 (Campus Smart Parking)
                taskRepository.save(Task.builder().projectId(p1.getId()).assignedTo(s1.getId()).title("Database Schema Design").description("Entity relationships for parking slots, reservations, and IoT sensor telemetry").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(5)).build());
                taskRepository.save(Task.builder().projectId(p1.getId()).assignedTo(s2.getId()).title("Sensor Data API Endpoint").description("REST endpoints for ultrasonic hardware sensors to transmit slot occupancy").status(TaskStatus.IN_PROGRESS).progress(60).dueDate(LocalDateTime.now().plusDays(3)).build());
                taskRepository.save(Task.builder().projectId(p1.getId()).assignedTo(s1.getId()).title("Real-Time Slot Reservation UI").description("Interactive React grid allowing students to tap and reserve available parking spots").status(TaskStatus.TODO).progress(0).dueDate(LocalDateTime.now().plusDays(6)).build());

                // Tasks - Project 2 (AI Study Planner)
                taskRepository.save(Task.builder().projectId(p2.getId()).assignedTo(s2.getId()).title("Study Session Algorithm").description("Heuristic recommendation engine for student study blocks").status(TaskStatus.IN_PROGRESS).progress(50).dueDate(LocalDateTime.now().plusDays(4)).build());
                taskRepository.save(Task.builder().projectId(p2.getId()).assignedTo(s1.getId()).title("Calendar Sync Integration").description("Google Calendar API OAuth flow for schedule syncing").status(TaskStatus.TODO).progress(0).dueDate(LocalDateTime.now().plusDays(8)).build());

                // Tasks - Project 3 (IoT Lab Monitor)
                taskRepository.save(Task.builder().projectId(p3.getId()).assignedTo(s3.getId()).title("MQTT Broker Deployment").description("Mosquitto broker setup on cloud instance").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(2)).build());
                taskRepository.save(Task.builder().projectId(p3.getId()).assignedTo(s3.getId()).title("ESP32 Firmware Programming").description("C++ code reading DHT22 and current sensors").status(TaskStatus.IN_PROGRESS).progress(40).dueDate(LocalDateTime.now().plusDays(5)).build());

                // Tasks - Project 4 (Student Event Hub)
                taskRepository.save(Task.builder().projectId(p4.getId()).assignedTo(s1.getId()).title("Ticketing & QR Code Generator").description("Generate verification QR codes on student tickets").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(15)).build());
                taskRepository.save(Task.builder().projectId(p4.getId()).assignedTo(s3.getId()).title("Admin Analytics Dashboard").description("Attendee attendance reports and exports").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(10)).build());

                // Project Progress
                projectProgressRepository.save(ProjectProgress.builder().projectId(p1.getId()).overallProgress(53).lastActivityAt(LocalDateTime.now().minusHours(2)).build());
                projectProgressRepository.save(ProjectProgress.builder().projectId(p2.getId()).overallProgress(30).lastActivityAt(LocalDateTime.now().minusDays(1)).build());
                projectProgressRepository.save(ProjectProgress.builder().projectId(p3.getId()).overallProgress(65).lastActivityAt(LocalDateTime.now().minusDays(2)).build());
                projectProgressRepository.save(ProjectProgress.builder().projectId(p4.getId()).overallProgress(100).lastActivityAt(LocalDateTime.now().minusDays(7)).build());

                // File Resources - Project 1
                fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s1.getId()).fileName("System_Architecture_Diagram_v1.2.png").fileType("image/png").fileSize(1024L * 850).resourceType(FileResourceType.DIAGRAM).fileUrl("/api/files/download/1").description("High-level system topology connecting ultrasonic sensors to Spring Boot backend").build());
                fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s1.getId()).fileName("Smart_Parking_SRS_Document.pdf").fileType("application/pdf").fileSize(1024L * 2400).resourceType(FileResourceType.DOCUMENT).fileUrl("/api/files/download/2").description("Comprehensive Software Requirements Specification approved by faculty mentor").build());
                fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s2.getId()).fileName("Smart-Parking-IoT-Firmware Repo").fileType("text/html").resourceType(FileResourceType.CODE).fileUrl("https://github.com/campus-project/smart-parking-iot").description("Official GitHub repository containing ESP32 sensor drivers and MQTT client code").build());
                fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s1.getId()).fileName("Figma Mobile & Web UI Prototypes").fileType("text/html").resourceType(FileResourceType.LINK).fileUrl("https://www.figma.com/design/sample-smart-parking-ui").description("Complete UI/UX design mockups with color guidelines and interactive components").build());

                // Messages - Project 1 Channel
                messageRepository.save(Message.builder().projectId(p1.getId()).senderId(s1.getId()).content("Hey team! Welcome to the Campus Smart Parking project channel. Let's finish the milestone this week!").messageType(MessageType.TEXT).isRead(true).createdAt(LocalDateTime.now().minusDays(2)).build());
                messageRepository.save(Message.builder().projectId(p1.getId()).senderId(s2.getId()).content("Hi Ananya, I uploaded the IoT firmware repository link under the Files tab. Take a look when you get a chance.").messageType(MessageType.TEXT).isRead(true).createdAt(LocalDateTime.now().minusDays(1)).build());
                messageRepository.save(Message.builder().projectId(p1.getId()).senderId(s1.getId()).content("Awesome work Rahul! I've updated the architecture diagram in Shared Resources as well.").messageType(MessageType.TEXT).isRead(true).createdAt(LocalDateTime.now().minusHours(3)).build());

                // Direct Messages (s1 Ananya & s3 Arjun)
                messageRepository.save(Message.builder().senderId(s3.getId()).receiverId(s1.getId()).content("Hey Ananya, do you have any open spots on your parking project? My skill profile matches Java and React.").messageType(MessageType.TEXT).isRead(true).createdAt(LocalDateTime.now().minusDays(1)).build());
                messageRepository.save(Message.builder().senderId(s1.getId()).receiverId(s3.getId()).content("Hi Arjun! We'd love to have you on board. Check out the AI matching tab in the Teams section!").messageType(MessageType.TEXT).isRead(true).createdAt(LocalDateTime.now().minusHours(5)).build());

                // Announcements
                announcementRepository.save(Announcement.builder().title("Project Evaluation Week Announced").content("Faculty evaluations will open next Monday. All teams must submit their progress reports and deliverables.").scope(AnnouncementScope.ALL).createdBy(s1.getId()).build());

                // Reviews
                teamMemberReviewRepository.save(TeamMemberReview.builder().projectId(p1.getId()).reviewerId(s1.getId()).revieweeId(s2.getId()).rating(5).comments("Strong technical contribution, reliable sensor driver code, and consistent communication.").build());
                teamMemberReviewRepository.save(TeamMemberReview.builder().projectId(p4.getId()).reviewerId(s1.getId()).revieweeId(s3.getId()).rating(5).comments("Excellent ownership of the backend integration.").build());
            }
        };
    }
}
