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
    private final FacultyFeedbackRepository facultyFeedbackRepository;
    private final ProjectEvaluationRepository projectEvaluationRepository;
    private final ProjectApprovalRepository projectApprovalRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final ProjectProgressRepository projectProgressRepository;
    private final FileResourceRepository fileResourceRepository;
    private final MessageRepository messageRepository;
    private final AnnouncementRepository announcementRepository;
    private final TeamMemberReviewRepository teamMemberReviewRepository;
    private final TeamJoinRequestRepository teamJoinRequestRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedSampleData() {
        return args -> {
            // 1. Wipe all existing data completely
            teamMemberReviewRepository.deleteAll();
            announcementRepository.deleteAll();
            messageRepository.deleteAll();
            notificationRepository.deleteAll();
            teamJoinRequestRepository.deleteAll();
            fileResourceRepository.deleteAll();
            taskRepository.deleteAll();
            projectProgressRepository.deleteAll();
            projectEvaluationRepository.deleteAll();
            projectApprovalRepository.deleteAll();
            facultyFeedbackRepository.deleteAll();
            projectMemberRepository.deleteAll();
            projectRepository.deleteAll();
            studentProfileRepository.deleteAll();
            facultyProfileRepository.deleteAll();
            userRepository.deleteAll();

            // 2. Admin (1 Admin)
            userRepository.save(User.builder()
                    .institutionalId("ADM10001")
                    .name("System Admin")
                    .email("admin@college.edu")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .accountStatus(AccountStatus.ACTIVE)
                    .build());

            // 3. 5 Student Leaders (Lead of 1 project each)
            User s1 = userRepository.save(User.builder().institutionalId("STU10001").name("Ananya Menon").email("ananya@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s2 = userRepository.save(User.builder().institutionalId("STU10002").name("Rahul Krishnan").email("rahul@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s3 = userRepository.save(User.builder().institutionalId("STU10003").name("Arjun Das").email("arjun@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s4 = userRepository.save(User.builder().institutionalId("STU10004").name("Sneha Nair").email("sneha@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s5 = userRepository.save(User.builder().institutionalId("STU10005").name("Kiran Paul").email("kiran@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());

            studentProfileRepository.save(StudentProfile.builder().userId(s1.getId()).department("CSE").skills("Java, Spring Boot, React, MySQL, Docker").bio("Full-stack developer & project lead for Campus Smart Parking.").githubUrl("https://github.com/ananya-dev").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s2.getId()).department("ECE").skills("Python, IoT, C++, Embedded Systems, MQTT").bio("Hardware & AI developer leading AI Study Planner.").githubUrl("https://github.com/rahul-iot").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s3.getId()).department("IT").skills("Node.js, Docker, MongoDB, React, Kubernetes").bio("Cloud architect & backend lead for IoT Lab Monitor.").githubUrl("https://github.com/arjun-cloud").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s4.getId()).department("CSE").skills("Python, PyTorch, FastAPI, Machine Learning, NLP").bio("AI specialist leading Automated Code Reviewer.").githubUrl("https://github.com/sneha-ai").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s5.getId()).department("MECH").skills("SolidWorks, MATLAB, Arduino, Robotics, ROS").bio("Robotics engineer leading Autonomous Drone Delivery.").githubUrl("https://github.com/kiran-robotics").build());

            // 4. 5 Students with NO Memberships (0 projects, ready to join)
            User s6 = userRepository.save(User.builder().institutionalId("STU10006").name("Devika R").email("devika@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s7 = userRepository.save(User.builder().institutionalId("STU10007").name("Siddharth Verma").email("siddharth@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s8 = userRepository.save(User.builder().institutionalId("STU10008").name("Meenakshi Pillai").email("meenakshi@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s9 = userRepository.save(User.builder().institutionalId("STU10009").name("Vishnu Prasad").email("vishnu@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());
            User s10 = userRepository.save(User.builder().institutionalId("STU10010").name("Rhea Thomas").email("rhea@college.edu").password(passwordEncoder.encode("Student@123")).role(Role.STUDENT).accountStatus(AccountStatus.ACTIVE).build());

            studentProfileRepository.save(StudentProfile.builder().userId(s6.getId()).department("CSE").skills("React, TypeScript, Next.js, TailwindCSS, Figma").bio("Frontend developer looking for exciting web app projects.").githubUrl("https://github.com/devika-frontend").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s7.getId()).department("IT").skills("Java, Spring Cloud, PostgreSQL, Microservices, Redis").bio("Backend specialist interested in scalable distributed systems.").githubUrl("https://github.com/siddharth-backend").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s8.getId()).department("AIDS").skills("Python, TensorFlow, Scikit-learn, Data Analytics, Pandas").bio("Data science & AI enthusiast seeking ML/NLP projects.").githubUrl("https://github.com/meenakshi-data").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s9.getId()).department("ECE").skills("C, C++, ESP32, Embedded C, Raspberry Pi").bio("Hardware enthusiast looking for IoT and automation teams.").githubUrl("https://github.com/vishnu-embedded").build());
            studentProfileRepository.save(StudentProfile.builder().userId(s10.getId()).department("CSE").skills("UI/UX Design, Figma, User Research, Wireframing, CSS").bio("Product designer looking to build sleek web & mobile experiences.").githubUrl("https://github.com/rhea-design").build());

            // 5. 5 Faculty Members
            User f1 = userRepository.save(User.builder().institutionalId("FAC10001").name("Dr. Meera Nair").email("meera@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());
            User f2 = userRepository.save(User.builder().institutionalId("FAC10002").name("Dr. Joseph Mathew").email("joseph@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());
            User f3 = userRepository.save(User.builder().institutionalId("FAC10003").name("Prof. Priya Sharma").email("priya@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());
            User f4 = userRepository.save(User.builder().institutionalId("FAC10004").name("Dr. Rajesh Varma").email("rajesh@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());
            User f5 = userRepository.save(User.builder().institutionalId("FAC10005").name("Prof. Thomas Kurian").email("thomas@college.edu").password(passwordEncoder.encode("Faculty@123")).role(Role.FACULTY).accountStatus(AccountStatus.ACTIVE).build());

            facultyProfileRepository.save(FacultyProfile.builder().userId(f1.getId()).department("CSE").designation("Professor & HOD").specialization("Machine Learning & Software Engineering").build());
            facultyProfileRepository.save(FacultyProfile.builder().userId(f2.getId()).department("ECE").designation("Associate Professor").specialization("Embedded Systems & Robotics").build());
            facultyProfileRepository.save(FacultyProfile.builder().userId(f3.getId()).department("IT").designation("Assistant Professor").specialization("Cloud Computing & Cyber Security").build());
            facultyProfileRepository.save(FacultyProfile.builder().userId(f4.getId()).department("AIDS").designation("Professor").specialization("Artificial Intelligence & Data Science").build());
            facultyProfileRepository.save(FacultyProfile.builder().userId(f5.getId()).department("MECH").designation("Assistant Professor").specialization("Mechatronics & Automated Control").build());

            // 6. Projects
            Project p1 = projectRepository.save(Project.builder().title("Campus Smart Parking").description("IoT and AI-based real-time parking spot reservation system for campus vehicles.").requiredSkills("Java, Spring Boot, React, IoT").status(ProjectStatus.OPEN).maxMembers(4).createdBy(s1.getId()).build());
            Project p2 = projectRepository.save(Project.builder().title("AI Study Planner").description("Smart calendar application generating personalized study routines using ML algorithms.").requiredSkills("Python, React, FastAPI, ML").status(ProjectStatus.OPEN).maxMembers(4).createdBy(s2.getId()).build());
            Project p3 = projectRepository.save(Project.builder().title("IoT Lab Monitor").description("Sensors monitoring temperature, humidity, and energy usage in university engineering laboratories.").requiredSkills("C++, Microcontrollers, MQTT, Cloud").status(ProjectStatus.OPEN).maxMembers(4).createdBy(s3.getId()).build());
            Project p4 = projectRepository.save(Project.builder().title("Automated Code Reviewer").description("AI-powered static analysis platform analyzing student Git commits for code smells and bugs.").requiredSkills("Python, PyTorch, FastAPI, React").status(ProjectStatus.OPEN).maxMembers(4).createdBy(s4.getId()).build());
            Project p5 = projectRepository.save(Project.builder().title("Autonomous Drone Delivery").description("Indoor quadcopter navigation and payload delivery system for urgent campus parcel transport.").requiredSkills("Robotics, ROS, C++, Arduino, Computer Vision").status(ProjectStatus.OPEN).maxMembers(4).createdBy(s5.getId()).build());

            // 7. Project Memberships: 5 Members with 3 Projects each, and 3 Projects Full (4/4)
            // Project 1 (Campus Smart Parking) - FULL (4/4)
            projectMemberRepository.save(ProjectMember.builder().projectId(p1.getId()).studentId(s1.getId()).role(ProjectMemberRole.LEADER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p1.getId()).studentId(s2.getId()).role(ProjectMemberRole.MEMBER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p1.getId()).studentId(s3.getId()).role(ProjectMemberRole.MEMBER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p1.getId()).studentId(s4.getId()).role(ProjectMemberRole.MEMBER).build());

            // Project 2 (AI Study Planner) - FULL (4/4)
            projectMemberRepository.save(ProjectMember.builder().projectId(p2.getId()).studentId(s2.getId()).role(ProjectMemberRole.LEADER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p2.getId()).studentId(s1.getId()).role(ProjectMemberRole.MEMBER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p2.getId()).studentId(s3.getId()).role(ProjectMemberRole.MEMBER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p2.getId()).studentId(s5.getId()).role(ProjectMemberRole.MEMBER).build());

            // Project 3 (IoT Lab Monitor) - FULL (4/4)
            projectMemberRepository.save(ProjectMember.builder().projectId(p3.getId()).studentId(s3.getId()).role(ProjectMemberRole.LEADER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p3.getId()).studentId(s1.getId()).role(ProjectMemberRole.MEMBER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p3.getId()).studentId(s2.getId()).role(ProjectMemberRole.MEMBER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p3.getId()).studentId(s5.getId()).role(ProjectMemberRole.MEMBER).build());

            // Project 4 (Automated Code Reviewer) - 1/4 Members (3 Open Seats)
            projectMemberRepository.save(ProjectMember.builder().projectId(p4.getId()).studentId(s4.getId()).role(ProjectMemberRole.LEADER).build());

            // Project 5 (Autonomous Drone Delivery) - 2/4 Members (2 Open Seats)
            projectMemberRepository.save(ProjectMember.builder().projectId(p5.getId()).studentId(s5.getId()).role(ProjectMemberRole.LEADER).build());
            projectMemberRepository.save(ProjectMember.builder().projectId(p5.getId()).studentId(s4.getId()).role(ProjectMemberRole.MEMBER).build());

            // 8. Sprint Tasks across all project teams
            // P1 Tasks (s1, s2, s3, s4)
            taskRepository.save(Task.builder().projectId(p1.getId()).assignedTo(s1.getId()).title("Database Schema & Parking Slot Topology").description("Entity relationships for parking slots, reservations, and IoT sensor telemetry").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(3)).build());
            taskRepository.save(Task.builder().projectId(p1.getId()).assignedTo(s2.getId()).title("Ultrasonic Sensor Drivers & MQTT Broker").description("REST endpoints and MQTT drivers for ultrasonic hardware sensors to transmit slot occupancy").status(TaskStatus.IN_PROGRESS).progress(60).dueDate(LocalDateTime.now().plusDays(4)).build());
            taskRepository.save(Task.builder().projectId(p1.getId()).assignedTo(s3.getId()).title("Cloud Ingestion Gateway & Redis Cache").description("Scalable caching layer for sub-second reservation state reads").status(TaskStatus.IN_PROGRESS).progress(45).dueDate(LocalDateTime.now().plusDays(5)).build());
            taskRepository.save(Task.builder().projectId(p1.getId()).assignedTo(s4.getId()).title("Real-Time Slot Reservation Web Grid").description("Interactive React grid allowing students to reserve parking spots").status(TaskStatus.TODO).progress(0).dueDate(LocalDateTime.now().plusDays(7)).build());

            // P2 Tasks (s2, s1, s3, s5)
            taskRepository.save(Task.builder().projectId(p2.getId()).assignedTo(s2.getId()).title("Study Session ML Optimization Engine").description("Heuristic recommendation engine for personalized student study blocks").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(2)).build());
            taskRepository.save(Task.builder().projectId(p2.getId()).assignedTo(s1.getId()).title("Spring Boot Schedule Sync API").description("Backend persistence and REST endpoints for scheduled study milestones").status(TaskStatus.IN_PROGRESS).progress(50).dueDate(LocalDateTime.now().plusDays(3)).build());
            taskRepository.save(Task.builder().projectId(p2.getId()).assignedTo(s3.getId()).title("Google Calendar OAuth2 Integration").description("OAuth flow and bidirectional calendar event synchronizer").status(TaskStatus.IN_PROGRESS).progress(35).dueDate(LocalDateTime.now().plusDays(6)).build());
            taskRepository.save(Task.builder().projectId(p2.getId()).assignedTo(s5.getId()).title("Interactive Focus Timer & Analytics UI").description("Pomodoro timer widget and study velocity chart components").status(TaskStatus.TODO).progress(0).dueDate(LocalDateTime.now().plusDays(8)).build());

            // P3 Tasks (s3, s1, s2, s5)
            taskRepository.save(Task.builder().projectId(p3.getId()).assignedTo(s3.getId()).title("Mosquitto MQTT Broker Infrastructure").description("Secure Mosquitto broker setup on cloud instance with TLS auth").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(3)).build());
            taskRepository.save(Task.builder().projectId(p3.getId()).assignedTo(s1.getId()).title("Telemetry Ingestion & Anomaly Alerts").description("Spring Boot backend filtering anomalous temperature/humidity spikes").status(TaskStatus.IN_PROGRESS).progress(70).dueDate(LocalDateTime.now().plusDays(2)).build());
            taskRepository.save(Task.builder().projectId(p3.getId()).assignedTo(s2.getId()).title("ESP32 & DHT22 Sensor Firmware").description("C++ code reading DHT22 and current sensors on campus lab boards").status(TaskStatus.IN_PROGRESS).progress(40).dueDate(LocalDateTime.now().plusDays(5)).build());
            taskRepository.save(Task.builder().projectId(p3.getId()).assignedTo(s5.getId()).title("Lab Environmental Monitoring Dashboard").description("Real-time telemetry gauges and SVG circuit status map").status(TaskStatus.TODO).progress(0).dueDate(LocalDateTime.now().plusDays(7)).build());

            // P4 Tasks (s4)
            taskRepository.save(Task.builder().projectId(p4.getId()).assignedTo(s4.getId()).title("Static AST Token Parser Engine").description("Python AST token parser for python & java code submissions").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(1)).build());
            taskRepository.save(Task.builder().projectId(p4.getId()).assignedTo(s4.getId()).title("LLM Prompt Engineering for Code Smells").description("Fine-tuned prompts for automated bug detection and code review suggestions").status(TaskStatus.IN_PROGRESS).progress(60).dueDate(LocalDateTime.now().plusDays(3)).build());

            // P5 Tasks (s5, s4)
            taskRepository.save(Task.builder().projectId(p5.getId()).assignedTo(s5.getId()).title("SolidWorks CAD Frame & 3D Print").description("Lightweight drone frame modeling and impact-resistant chassis printing").status(TaskStatus.COMPLETED).progress(100).dueDate(LocalDateTime.now().minusDays(4)).build());
            taskRepository.save(Task.builder().projectId(p5.getId()).assignedTo(s4.getId()).title("YOLOv8 Edge Obstacle Avoidance Vision").description("Computer vision model detecting indoor campus obstacles in real time").status(TaskStatus.IN_PROGRESS).progress(45).dueDate(LocalDateTime.now().plusDays(4)).build());
            taskRepository.save(Task.builder().projectId(p5.getId()).assignedTo(s5.getId()).title("PID Flight Controller Firmware").description("Arduino and MPU6050 gyro stabilization code").status(TaskStatus.IN_PROGRESS).progress(40).dueDate(LocalDateTime.now().plusDays(5)).build());

            // 9. Project Progress Records
            projectProgressRepository.save(ProjectProgress.builder().projectId(p1.getId()).overallProgress(75).lastActivityAt(LocalDateTime.now().minusHours(1)).build());
            projectProgressRepository.save(ProjectProgress.builder().projectId(p2.getId()).overallProgress(65).lastActivityAt(LocalDateTime.now().minusHours(2)).build());
            projectProgressRepository.save(ProjectProgress.builder().projectId(p3.getId()).overallProgress(80).lastActivityAt(LocalDateTime.now().minusHours(3)).build());
            projectProgressRepository.save(ProjectProgress.builder().projectId(p4.getId()).overallProgress(60).lastActivityAt(LocalDateTime.now().minusHours(5)).build());
            projectProgressRepository.save(ProjectProgress.builder().projectId(p5.getId()).overallProgress(50).lastActivityAt(LocalDateTime.now().minusHours(2)).build());

            // 10. File Resources & Project Deliverables Showcase
            // P1: Campus Smart Parking Deliverables
            fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s1.getId()).fileName("Campus-Smart-Parking-Repo").fileType("text/html").resourceType(FileResourceType.CODE).fileUrl("https://github.com/campus-project/smart-parking-iot").description("Official GitHub repository containing ESP32 sensor drivers, MQTT client, and Spring Boot gateway").build());
            fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s1.getId()).fileName("Campus_Smart_Parking_Demo_Walkthrough.mp4").fileType("video/mp4").fileSize(1024L * 1024 * 38).resourceType(FileResourceType.VIDEO).fileUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ").description("End-to-end video demonstration of ultrasonic sensor detection and live mobile slot reservation (4m 15s)").build());
            fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s1.getId()).fileName("System_Architecture_Topology.png").fileType("image/png").fileSize(1024L * 850).resourceType(FileResourceType.DIAGRAM).fileUrl("/api/files/download/1").description("High-level system topology connecting ultrasonic sensors to Spring Boot backend and Redis cache").build());
            fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s1.getId()).fileName("Live_Parking_Grid_Dashboard.png").fileType("image/png").fileSize(1024L * 1250).resourceType(FileResourceType.IMAGE).fileUrl("/api/files/download/2").description("High-resolution screenshot of the student mobile interface for real-time spot occupancy").build());
            fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s2.getId()).fileName("ESP32_Ultrasonic_Wiring_Prototype.jpg").fileType("image/jpeg").fileSize(1024L * 980).resourceType(FileResourceType.IMAGE).fileUrl("/api/files/download/3").description("Hardware photo of breadboard sensor circuit with ESP32 microcontroller and HC-SR04 ultrasonic sensors").build());
            fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s1.getId()).fileName("Smart_Parking_SRS_Specification.pdf").fileType("application/pdf").fileSize(1024L * 2400).resourceType(FileResourceType.DOCUMENT).fileUrl("/api/files/download/4").description("Comprehensive Software Requirements Specification approved by faculty mentor").build());
            fileResourceRepository.save(FileResource.builder().projectId(p1.getId()).uploadedBy(s1.getId()).fileName("Smart Parking Live Cloud Deployment").fileType("text/html").resourceType(FileResourceType.LINK).fileUrl("https://smart-parking-campus.vercel.app").description("Live production staging deployment for slot reservation testing").build());

            // P2: AI Study Planner Deliverables
            fileResourceRepository.save(FileResource.builder().projectId(p2.getId()).uploadedBy(s2.getId()).fileName("AI-Study-Planner-Repo").fileType("text/html").resourceType(FileResourceType.CODE).fileUrl("https://github.com/campus-project/ai-study-planner").description("Official GitHub repository with ML optimization engine, FastAPI microservice, and React frontend").build());
            fileResourceRepository.save(FileResource.builder().projectId(p2.getId()).uploadedBy(s2.getId()).fileName("AI_Study_Planner_Feature_Tour.mp4").fileType("video/mp4").fileSize(1024L * 1024 * 29).resourceType(FileResourceType.VIDEO).fileUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ").description("Video demo of AI routine generation, Pomodoro focus mode, and Google Calendar sync (3m 40s)").build());
            fileResourceRepository.save(FileResource.builder().projectId(p2.getId()).uploadedBy(s2.getId()).fileName("ML_Schedule_Recommendation_Pipeline.png").fileType("image/png").fileSize(1024L * 720).resourceType(FileResourceType.DIAGRAM).fileUrl("/api/files/download/5").description("Architecture diagram of heuristic AI recommendation model and event scoring algorithms").build());
            fileResourceRepository.save(FileResource.builder().projectId(p2.getId()).uploadedBy(s2.getId()).fileName("Study_Calendar_Focus_Mode_UI.png").fileType("image/png").fileSize(1024L * 1400).resourceType(FileResourceType.IMAGE).fileUrl("/api/files/download/6").description("UI screenshot showcasing smart schedule calendar and Pomodoro focus timer widget").build());
            fileResourceRepository.save(FileResource.builder().projectId(p2.getId()).uploadedBy(s2.getId()).fileName("AI_Study_Planner_Design_Spec.pdf").fileType("application/pdf").fileSize(1024L * 1850).resourceType(FileResourceType.DOCUMENT).fileUrl("/api/files/download/7").description("System design document including ML pipeline and OAuth2 Google Calendar sync architecture").build());

            // P3: IoT Lab Monitor Deliverables
            fileResourceRepository.save(FileResource.builder().projectId(p3.getId()).uploadedBy(s3.getId()).fileName("IoT-Lab-Monitor-Repo").fileType("text/html").resourceType(FileResourceType.CODE).fileUrl("https://github.com/campus-project/iot-lab-monitor").description("Official GitHub repo with ESP32 firmware, Mosquitto MQTT broker configuration, and Grafana dashboard configs").build());
            fileResourceRepository.save(FileResource.builder().projectId(p3.getId()).uploadedBy(s3.getId()).fileName("IoT_Lab_Telemetry_Live_Demo.mp4").fileType("video/mp4").fileSize(1024L * 1024 * 45).resourceType(FileResourceType.VIDEO).fileUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ").description("Real-time environmental telemetry streaming demo showing heat alerts and sensor spike graphs (5m 10s)").build());
            fileResourceRepository.save(FileResource.builder().projectId(p3.getId()).uploadedBy(s3.getId()).fileName("Mosquitto_MQTT_Cluster_Topology.png").fileType("image/png").fileSize(1024L * 920).resourceType(FileResourceType.DIAGRAM).fileUrl("/api/files/download/8").description("Network diagram of secure Mosquitto broker setup on university cloud instance").build());
            fileResourceRepository.save(FileResource.builder().projectId(p3.getId()).uploadedBy(s3.getId()).fileName("Grafana_Lab_Telemetry_Gauges.png").fileType("image/png").fileSize(1024L * 1550).resourceType(FileResourceType.IMAGE).fileUrl("/api/files/download/9").description("Grafana dashboard screenshot with live temperature, humidity, and energy consumption gauges").build());
            fileResourceRepository.save(FileResource.builder().projectId(p3.getId()).uploadedBy(s3.getId()).fileName("ESP32_DHT22_Lab_Hardware_Unit.jpg").fileType("image/jpeg").fileSize(1024L * 1100).resourceType(FileResourceType.IMAGE).fileUrl("/api/files/download/10").description("Physical photo of assembled sensor enclosure installed inside the electrical lab").build());
            fileResourceRepository.save(FileResource.builder().projectId(p3.getId()).uploadedBy(s3.getId()).fileName("IoT_Lab_Safety_Compliance_Report.pdf").fileType("application/pdf").fileSize(1024L * 2100).resourceType(FileResourceType.DOCUMENT).fileUrl("/api/files/download/11").description("Official laboratory environmental compliance report and sensor tolerance specification").build());

            // P4: Automated Code Reviewer Deliverables
            fileResourceRepository.save(FileResource.builder().projectId(p4.getId()).uploadedBy(s4.getId()).fileName("Automated-Code-Reviewer-Repo").fileType("text/html").resourceType(FileResourceType.CODE).fileUrl("https://github.com/campus-project/automated-code-reviewer").description("Official GitHub repo with Python AST grammar parser, LLM code review prompts, and FastAPI server").build());
            fileResourceRepository.save(FileResource.builder().projectId(p4.getId()).uploadedBy(s4.getId()).fileName("Code_Reviewer_AST_LLM_Walkthrough.mp4").fileType("video/mp4").fileSize(1024L * 1024 * 32).resourceType(FileResourceType.VIDEO).fileUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ").description("Video demonstration of automated Git commit linting, AST token parsing, and AI code review annotations (4m 50s)").build());
            fileResourceRepository.save(FileResource.builder().projectId(p4.getId()).uploadedBy(s4.getId()).fileName("AST_Token_Parser_Grammar_Tree.png").fileType("image/png").fileSize(1024L * 880).resourceType(FileResourceType.DIAGRAM).fileUrl("/api/files/download/12").description("Diagram illustrating the Abstract Syntax Tree tokenization and code smell detection graph").build());
            fileResourceRepository.save(FileResource.builder().projectId(p4.getId()).uploadedBy(s4.getId()).fileName("Code_Smell_Diff_Inspector_UI.png").fileType("image/png").fileSize(1024L * 1320).resourceType(FileResourceType.IMAGE).fileUrl("/api/files/download/13").description("UI screenshot of git commit diff view with automated inline AI recommendations").build());
            fileResourceRepository.save(FileResource.builder().projectId(p4.getId()).uploadedBy(s4.getId()).fileName("AST_LLM_Static_Analysis_Spec.pdf").fileType("application/pdf").fileSize(1024L * 1750).resourceType(FileResourceType.DOCUMENT).fileUrl("/api/files/download/14").description("Static analysis technical specification and benchmark accuracy comparison document").build());

            // P5: Autonomous Drone Delivery Deliverables
            fileResourceRepository.save(FileResource.builder().projectId(p5.getId()).uploadedBy(s5.getId()).fileName("Autonomous-Drone-Delivery-Repo").fileType("text/html").resourceType(FileResourceType.CODE).fileUrl("https://github.com/campus-project/autonomous-drone-delivery").description("Official GitHub repo with ROS navigation stack, Arduino flight controller firmware, and YOLOv8 models").build());
            fileResourceRepository.save(FileResource.builder().projectId(p5.getId()).uploadedBy(s5.getId()).fileName("Drone_ROS_Indoor_Flight_Test.mp4").fileType("video/mp4").fileSize(1024L * 1024 * 54).resourceType(FileResourceType.VIDEO).fileUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ").description("Video footage of autonomous quadcopter indoor waypoint navigation and obstacle avoidance flight test (6m 20s)").build());
            fileResourceRepository.save(FileResource.builder().projectId(p5.getId()).uploadedBy(s5.getId()).fileName("SolidWorks_Drone_Frame_CAD.png").fileType("image/png").fileSize(1024L * 1150).resourceType(FileResourceType.DIAGRAM).fileUrl("/api/files/download/15").description("SolidWorks 3D CAD schematic of custom lightweight quadcopter frame and payload gripper").build());
            fileResourceRepository.save(FileResource.builder().projectId(p5.getId()).uploadedBy(s5.getId()).fileName("YOLOv8_Obstacle_Avoidance_Vision.png").fileType("image/png").fileSize(1024L * 1480).resourceType(FileResourceType.IMAGE).fileUrl("/api/files/download/16").description("Real-time vision feed screenshot showing bounding box detection of indoor corridors and obstacles").build());
            fileResourceRepository.save(FileResource.builder().projectId(p5.getId()).uploadedBy(s5.getId()).fileName("Quadcopter_Assembly_Prototype.jpg").fileType("image/jpeg").fileSize(1024L * 1200).resourceType(FileResourceType.IMAGE).fileUrl("/api/files/download/17").description("High-resolution photo of completed quadcopter drone assembly with battery and gripper payload").build());
            fileResourceRepository.save(FileResource.builder().projectId(p5.getId()).uploadedBy(s5.getId()).fileName("Autonomous_Drone_Aviation_Safety_Document.pdf").fileType("application/pdf").fileSize(1024L * 2600).resourceType(FileResourceType.DOCUMENT).fileUrl("/api/files/download/18").description("Comprehensive autonomous aerial vehicle safety protocol and emergency failsafe manual").build());

            // 11. Faculty Mentorship Feedback
            facultyFeedbackRepository.save(FacultyFeedback.builder()
                    .projectId(p1.getId())
                    .facultyId(f1.getId())
                    .feedbackText("Solid progress on the system architecture and sensor integration. Full team assembled and sprint velocity is high.")
                    .rating(5)
                    .build());
            facultyFeedbackRepository.save(FacultyFeedback.builder()
                    .projectId(p2.getId())
                    .facultyId(f1.getId())
                    .feedbackText("ML optimization engine design looks very promising. Ensure calendar sync edge cases are handled.")
                    .rating(5)
                    .build());

            // 12. Peer Reviews
            teamMemberReviewRepository.save(TeamMemberReview.builder().projectId(p1.getId()).reviewerId(s1.getId()).revieweeId(s2.getId()).rating(5).comments("Excellent IoT hardware drivers and fast MQTT telemetry integration.").build());
            teamMemberReviewRepository.save(TeamMemberReview.builder().projectId(p1.getId()).reviewerId(s2.getId()).revieweeId(s1.getId()).rating(5).comments("Great project leadership, clear database design, and helpful sprint coordination.").build());
            teamMemberReviewRepository.save(TeamMemberReview.builder().projectId(p2.getId()).reviewerId(s2.getId()).revieweeId(s3.getId()).rating(5).comments("Strong cloud infrastructure and clean OAuth2 integration.").build());

            // 13. Team Join Requests & Invitations
            // Active join requests from seeker students for open projects P4 & P5
            teamJoinRequestRepository.save(TeamJoinRequest.builder().projectId(p4.getId()).studentId(s6.getId()).message("Hi Sneha, I have strong React & TypeScript frontend experience to build a great code review UI.").status(JoinRequestStatus.PENDING).build());
            teamJoinRequestRepository.save(TeamJoinRequest.builder().projectId(p5.getId()).studentId(s9.getId()).message("Hi Kiran, I have worked with ESP32, Arduino, and hardware drivers and would love to build the drone telemetry.").status(JoinRequestStatus.PENDING).build());

            // Interactive Invitation Notifications for Seeker Students
            notificationRepository.save(Notification.builder()
                    .userId(s6.getId())
                    .title("🎯 Team Invitation: Automated Code Reviewer")
                    .message("Sneha Nair invited you to join team for project \"Automated Code Reviewer\" based on your skill match. Note: \"Hi Devika, your React and frontend skills are a perfect fit for our review dashboard!\"")
                    .type(NotificationType.JOIN_REQUEST)
                    .referenceId(p4.getId())
                    .referenceType("PROJECT")
                    .isRead(false)
                    .build());

            notificationRepository.save(Notification.builder()
                    .userId(s7.getId())
                    .title("🎯 Team Invitation: Autonomous Drone Delivery")
                    .message("Kiran Paul invited you to join team for project \"Autonomous Drone Delivery\" based on your skill match. Note: \"Hi Siddharth, your backend microservices experience would be huge for our drone fleet telemetry!\"")
                    .type(NotificationType.JOIN_REQUEST)
                    .referenceId(p5.getId())
                    .referenceType("PROJECT")
                    .isRead(false)
                    .build());

            // Notification for s4 about join request
            notificationRepository.save(Notification.builder()
                    .userId(s4.getId())
                    .title("New Team Join Request")
                    .message("Devika R requested to join your project 'Automated Code Reviewer'.")
                    .type(NotificationType.JOIN_REQUEST)
                    .referenceId(p4.getId())
                    .referenceType("PROJECT")
                    .isRead(false)
                    .build());

            // 14. Announcements
            announcementRepository.save(Announcement.builder()
                    .title("Capstone Project Collaboration Round Open")
                    .content("Project teams are actively collaborating. Check out open projects or review invitations in your Notification Center.")
                    .scope(AnnouncementScope.ALL)
                    .createdBy(s1.getId())
                    .build());
        };
    }
}
