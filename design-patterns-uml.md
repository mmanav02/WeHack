# Design Patterns UML Diagrams - WeHack Platform

## 1. Adapter Pattern - Email Services

```plantuml
@startuml Adapter_Pattern_Email
interface MailServiceAdapter {
    +sendMail(organizer: User, recipient: String, subject: String, body: String): void
}

class MailgunAdapter {
    -domain: String
    -apiKey: String
    -baseUrl: String
    -http: HttpClient
    +sendMail(organizer: User, recipient: String, subject: String, body: String): void
    -field(name: String, value: String): String
}

class SpringMailServiceAdapter {
    -mailSender: JavaMailSender
    +sendMail(organizer: User, recipient: String, subject: String, body: String): void
}

class NullMailServiceAdapter {
    +sendMail(organizer: User, recipient: String, subject: String, body: String): void
}

class OrganizerMailAdapter {
    +sendMail(organizer: User, recipient: String, subject: String, body: String): void
}

class SubmissionServiceImpl {
    -mailServiceAdapter: MailServiceAdapter
    +notifyOrganizer(hackathon: Hackathon, organizer: User, recipients: List<String>, subject: String, content: String): void
}

MailServiceAdapter <|.. MailgunAdapter
MailServiceAdapter <|.. SpringMailServiceAdapter
MailServiceAdapter <|.. NullMailServiceAdapter
MailServiceAdapter <|.. OrganizerMailAdapter
SubmissionServiceImpl --> MailServiceAdapter

note right of MailgunAdapter : Adapts Mailgun REST API\nto common interface
note right of SpringMailServiceAdapter : Adapts JavaMailSender SMTP\nto common interface
note right of NullMailServiceAdapter : Null Object Pattern\nDoes nothing
note right of OrganizerMailAdapter : Adapts organizer's SMTP\nto common interface

@enduml
```

## 2. Observer Pattern - Hackathon Notifications

```plantuml
@startuml Observer_Pattern_Hackathon
interface HackathonObserver {
    +update(message: String): void
}

class JudgeNotifier {
    -judgeEmail: String
    -organizer: User
    -mailer: MailServiceAdapter
    +update(message: String): void
}

class HackathonNotificationManager {
    -observers: List<HackathonObserver>
    +registerObserver(observer: HackathonObserver): void
    +removeObserver(observer: HackathonObserver): void
    +notifyObservers(hackathonId: int, message: String): void
}

class HackathonObserverRegistry {
    {static} -observersMap: Map<Integer, List<HackathonObserver>>
    {static} +registerObserver(hackathonId: int, observer: HackathonObserver): void
    {static} +getObservers(hackathonId: int): List<HackathonObserver>
}

class HackathonServiceImpl {
    +publishHackathon(hackathonId: int): void
    +startJudging(hackathonId: int): void
    +completeHackathon(hackathonId: int): void
    +updateJudgeStatus(hackathonId: Long, userId: Long, status: ApprovalStatus): HackathonRole
}

HackathonObserver <|.. JudgeNotifier
HackathonNotificationManager --> HackathonObserver
HackathonServiceImpl --> HackathonNotificationManager
HackathonServiceImpl --> HackathonObserverRegistry
JudgeNotifier --> MailServiceAdapter

note right of JudgeNotifier : Concrete Observer\nSends email notifications\nto judges
note right of HackathonNotificationManager : Subject that manages\nand notifies observers
note right of HackathonObserverRegistry : Registry for storing\nobservers per hackathon

@enduml
```

## 3. Decorator Pattern - Notification Services

```plantuml
@startuml Decorator_Pattern_Notifications
interface Notifier {
    +notify(organizer: User, recipient: String, subject: String, content: String): void
}

class EmailNotifier {
    -mailServiceAdapter: MailServiceAdapter
    +notify(organizer: User, recipient: String, subject: String, content: String): void
}

abstract class NotifierDecorator {
    #wrappee: Notifier
    +setWrappee(wrappee: Notifier): void
    +notify(organizer: User, recipient: String, subject: String, content: String): void
}

class SlackNotifierDecorator {
    -webClient: WebClient
    -slackWebhookUrl: String
    +notify(organizer: User, recipient: String, subject: String, content: String): void
    -sendSlackNotification(organizer: User, subject: String, content: String): void
}

class SubmissionServiceImpl {
    +notifyOrganizer(hackathon: Hackathon, organizer: User, recipients: List<String>, subject: String, content: String): void
}

Notifier <|.. EmailNotifier
Notifier <|.. NotifierDecorator
NotifierDecorator <|-- SlackNotifierDecorator
NotifierDecorator --> Notifier
SubmissionServiceImpl --> Notifier
EmailNotifier --> MailServiceAdapter

note right of EmailNotifier : Base implementation\nSends email notifications
note right of SlackNotifierDecorator : Decorator that adds\nSlack notifications\nto base functionality
note right of NotifierDecorator : Abstract decorator\nDefines decoration interface

@enduml
```

## 4. Builder Pattern - Submission Creation

```plantuml
@startuml Builder_Pattern_Submission
class Submission {
    -id: Long
    -title: String
    -description: String
    -projectUrl: String
    -submitTime: Instant
    -filePath: String
    -user: User
    -team: Team
    -hackathon: Hackathon
    -isPrimary: boolean
    +createMemento(): SubmissionMemento
    +restore(memento: SubmissionMemento): void
}

class SubmissionBuilder {
    -submission: Submission
    +title(title: String): SubmissionBuilder
    +description(description: String): SubmissionBuilder
    +projectUrl(projectUrl: String): SubmissionBuilder
    +setSubmitTime(): SubmissionBuilder
    +team(team: Team): SubmissionBuilder
    +setUser(user: User): SubmissionBuilder
    +setHackathon(hackathon: Hackathon): SubmissionBuilder
    +build(): Submission
}

class SubmissionServiceImpl {
    +createFinalSubmission(builder: SubmissionBuilder, userId: Long, hackathonId: int, file: MultipartFile): Submission
}

SubmissionBuilder --> Submission : builds
SubmissionServiceImpl --> SubmissionBuilder : uses

note right of SubmissionBuilder : Builder pattern allows\nflexible construction\nof complex Submission objects
note right of SubmissionServiceImpl : Director that uses\nbuilder to create submissions

@enduml
```

## 5. Memento Pattern - Submission History

```plantuml
@startuml Memento_Pattern_Submission
class Submission {
    -title: String
    -description: String
    -projectUrl: String
    -submitTime: Instant
    -filePath: String
    +createMemento(): SubmissionMemento
    +restore(memento: SubmissionMemento): void
}

class SubmissionMemento {
    -title: String
    -description: String
    -projectUrl: String
    -submitTime: Instant
    -filePath: String
    +getTitle(): String
    +getDescription(): String
    +getProjectUrl(): String
    +getSubmitTime(): Instant
    +getFilePath(): String
}

class SubmissionHistoryManager {
    -history: Map<Long, Stack<SubmissionMemento>>
    +push(teamId: Long, memento: SubmissionMemento): void
    +pop(teamId: Long): Optional<SubmissionMemento>
}

class SubmissionServiceImpl {
    -submissionHistoryManager: SubmissionHistoryManager
    +editSubmission(...): Submission
    +undoLastEdit(teamId: Long, submissionId: Long, hackathonId: Long): Submission
}

Submission --> SubmissionMemento : creates
Submission <-- SubmissionMemento : restores from
SubmissionHistoryManager --> SubmissionMemento : stores
SubmissionServiceImpl --> SubmissionHistoryManager : uses

note right of SubmissionMemento : Memento stores\nsubmission state\nfor undo functionality
note right of SubmissionHistoryManager : Caretaker manages\nmemento history\nper team
note right of Submission : Originator creates\nand restores from\nmementos

@enduml
```

## 6. State Pattern - Hackathon Lifecycle

```plantuml
@startuml State_Pattern_Hackathon
interface HackathonState {
    +publish(hackathon: Hackathon): void
    +beginJudging(hackathon: Hackathon): void
    +complete(hackathon: Hackathon): void
}

class DraftState {
    +publish(hackathon: Hackathon): void
    +beginJudging(hackathon: Hackathon): void
    +complete(hackathon: Hackathon): void
}

class PublishedState {
    +publish(hackathon: Hackathon): void
    +beginJudging(hackathon: Hackathon): void
    +complete(hackathon: Hackathon): void
}

class JudgingState {
    +publish(hackathon: Hackathon): void
    +beginJudging(hackathon: Hackathon): void
    +complete(hackathon: Hackathon): void
}

class CompletedState {
    +publish(hackathon: Hackathon): void
    +beginJudging(hackathon: Hackathon): void
    +complete(hackathon: Hackathon): void
}

class HackathonContext {
    -state: HackathonState
    +HackathonContext(state: HackathonState)
    +publish(hackathon: Hackathon): void
    +beginJudging(hackathon: Hackathon): void
    +complete(hackathon: Hackathon): void
}

class Hackathon {
    -status: String
    +setStatus(status: String): void
    +getStatus(): String
}

HackathonState <|.. DraftState
HackathonState <|.. PublishedState
HackathonState <|.. JudgingState
HackathonState <|.. CompletedState
HackathonContext --> HackathonState
HackathonContext --> Hackathon

note right of DraftState : Initial state\nCan be published
note right of PublishedState : Open for registration\nCan start judging
note right of JudgingState : Judging phase\nCan be completed
note right of CompletedState : Final state\nNo transitions allowed

@enduml
```

## 7. Iterator Pattern - Collection Processing

```plantuml
@startuml Iterator_Pattern_Collections
interface Iterator<T> {
    +hasNext(): boolean
    +next(): T
}

interface Aggregate<T> {
    +createIterator(): Iterator<T>
}

class HackathonCollection {
    -hackathons: List<Hackathon>
    +createIterator(): Iterator<Hackathon>
    +iterator(): java.util.Iterator<Hackathon>
}

class HackathonIterator {
    -hackathons: List<Hackathon>
    -position: int
    +hasNext(): boolean
    +next(): Hackathon
}

class SubmissionCollection {
    -submissions: List<Submission>
    +createIterator(): Iterator<Submission>
}

class SubmissionIterator {
    -submissions: List<Submission>
    -position: int
    +hasNext(): boolean
    +next(): Submission
}

class CollectionFactory {
    -submissionRepository: SubmissionRepository
    -hackathonRepository: HackathonRepository
    +hackathons(): HackathonCollection
    +submissions(team: Team, hackathon: Hackathon): SubmissionCollection
    +teams(hackathon: Hackathon): TeamCollection
}

Iterator <|.. HackathonIterator
Iterator <|.. SubmissionIterator
Aggregate <|.. HackathonCollection
Aggregate <|.. SubmissionCollection
HackathonCollection --> HackathonIterator : creates
SubmissionCollection --> SubmissionIterator : creates
CollectionFactory --> HackathonCollection : creates
CollectionFactory --> SubmissionCollection : creates

note right of CollectionFactory : Factory creates\ndifferent collection types\nwith their iterators
note right of HackathonIterator : Concrete iterator\nfor hackathon collections
note right of SubmissionIterator : Concrete iterator\nfor submission collections

@enduml
```

## 8. Factory Pattern - Role Creation

```plantuml
@startuml Factory_Pattern_Role
enum Role {
    PARTICIPANT
    JUDGE
    ORGANIZER
}

enum ApprovalStatus {
    PENDING
    APPROVED
    REJECTED
}

class HackathonRole {
    -id: Long
    -user: User
    -hackathon: Hackathon
    -role: Role
    -status: ApprovalStatus
}

class HackathonRoleFactory {
    {static} +create(user: User, hackathon: Hackathon, role: Role): HackathonRole
}

class HackathonServiceImpl {
    +joinHackathon(userId: Long, hackathonId: int, role: Role): HackathonRole
}

HackathonRoleFactory --> HackathonRole : creates
HackathonRoleFactory --> Role : uses
HackathonRole --> Role : has
HackathonRole --> ApprovalStatus : has
HackathonServiceImpl --> HackathonRoleFactory : uses

note right of HackathonRoleFactory : Factory method creates\nHackathonRole objects\nwith appropriate defaults
note right of HackathonServiceImpl : Client uses factory\nto create roles

@enduml
```

## 9. Template Method Pattern - Scoreboard Generation

```plantuml
@startuml Template_Method_Pattern_Scoreboard
abstract class ScoreboardTemplate {
    +generate(hackathonId: Long): List<Submission>
    #{abstract} filterSubmissions(hackathonId: Long): List<Submission>
    #{abstract} sortSubmissions(submissions: List<Submission>): List<Submission>
    #validateHackathon(hackathonId: Long): void
}

class BuildPhaseScoreboard {
    #filterSubmissions(hackathonId: Long): List<Submission>
    #sortSubmissions(submissions: List<Submission>): List<Submission>
}

class JudgingPhaseScoreboard {
    #filterSubmissions(hackathonId: Long): List<Submission>
    #sortSubmissions(submissions: List<Submission>): List<Submission>
}

class HackathonServiceImpl {
    +getLeaderboard(hackathonId: Long): List<Submission>
}

ScoreboardTemplate <|-- BuildPhaseScoreboard
ScoreboardTemplate <|-- JudgingPhaseScoreboard
HackathonServiceImpl --> ScoreboardTemplate

note right of ScoreboardTemplate : Template method defines\ngeneral algorithm structure\nwith customizable steps
note right of BuildPhaseScoreboard : Shows all submissions\nduring build phase
note right of JudgingPhaseScoreboard : Shows only primary\nsubmissions during judging

@enduml
```

## 10. Strategy Pattern - Email Provider Selection

```plantuml
@startuml Strategy_Pattern_Email_Provider
interface MailServiceAdapter {
    +sendMail(organizer: User, recipient: String, subject: String, body: String): void
}

class MailgunAdapter {
    +sendMail(organizer: User, recipient: String, subject: String, body: String): void
}

class SpringMailServiceAdapter {
    +sendMail(organizer: User, recipient: String, subject: String, body: String): void
}

class NullMailServiceAdapter {
    +sendMail(organizer: User, recipient: String, subject: String, body: String): void
}

class OrganizerMailAdapter {
    +sendMail(organizer: User, recipient: String, subject: String, body: String): void
}

class EmailContext {
    -strategy: MailServiceAdapter
    +setStrategy(strategy: MailServiceAdapter): void
    +sendEmail(organizer: User, recipient: String, subject: String, body: String): void
}

note as SpringConfig
Spring Configuration
@ConditionalOnProperty determines
which strategy is loaded:

notifications.email.provider=mailgun
→ MailgunAdapter

notifications.email.provider=spring  
→ SpringMailServiceAdapter

notifications.email.provider=null
→ NullMailServiceAdapter

notifications.email.provider=organizer
→ OrganizerMailAdapter
end note

MailServiceAdapter <|.. MailgunAdapter
MailServiceAdapter <|.. SpringMailServiceAdapter
MailServiceAdapter <|.. NullMailServiceAdapter
MailServiceAdapter <|.. OrganizerMailAdapter
EmailContext --> MailServiceAdapter

SpringConfig .. MailServiceAdapter

note right of EmailContext : Context uses different\nemail strategies based\non configuration
note right of MailServiceAdapter : Strategy interface\ndefines email sending\nalgorithm

@enduml
```

## Pattern Usage Summary

| Pattern | Usage | Classes Involved |
|---------|-------|------------------|
| **Adapter** | Unified email interface | `MailServiceAdapter`, `MailgunAdapter`, `SpringMailServiceAdapter`, `NullMailServiceAdapter` |
| **Observer** | Hackathon notifications | `HackathonObserver`, `JudgeNotifier`, `HackathonNotificationManager` |
| **Decorator** | Enhanced notifications | `Notifier`, `EmailNotifier`, `SlackNotifierDecorator` |
| **Builder** | Submission construction | `SubmissionBuilder`, `Submission` |
| **Memento** | Submission history/undo | `SubmissionMemento`, `SubmissionHistoryManager` |
| **State** | Hackathon lifecycle | `HackathonState`, `DraftState`, `PublishedState`, `JudgingState`, `CompletedState` |
| **Iterator** | Collection traversal | `Iterator`, `HackathonCollection`, `SubmissionCollection` |
| **Factory** | Role object creation | `HackathonRoleFactory`, `HackathonRole` |
| **Template Method** | Scoreboard generation | `ScoreboardTemplate`, `BuildPhaseScoreboard`, `JudgingPhaseScoreboard` |
| **Strategy** | Email provider selection | Dynamic loading via Spring `@ConditionalOnProperty` |
| **Null Object** | No-op email service | `NullMailServiceAdapter` |
| **Proxy** | Validation & security | `SubmissionServiceProxy`, rate limiting, validation chain |
| **Chain of Responsibility** | Submission validation | `SubmissionValidator`, `TitleValidator`, `DescriptionValidator`, `FileSizeValidator` |
| **Visitor** | Analytics collection | `AnalyticsVisitor`, `AnalyticsCollector` |
| **Abstract Factory** | Collection creation | `CollectionFactory` creates different collection types |
| **Repository** | Data access abstraction | `SubmissionRepository`, `HackathonRepository`, `UserRepository` |
| **MVC** | Web architecture | Controllers, Services, Models separation |
| **Dependency Injection** | Spring framework | `@Autowired`, `@Service`, `@Component` annotations |

## Additional Patterns (12-18):

### 12. Proxy Pattern - Validation and Rate Limiting

```plantuml
@startuml Proxy_Pattern_Submission
interface SubmissionService {
    +validateSubmission(userId: Long, hackathonId: int, submission: Submission, file: MultipartFile): Submission
    +saveSubmission(userId: Long, hackathonId: int, submission: Submission): Submission
    +editSubmission(...): Submission
}

class SubmissionServiceImpl {
    +validateSubmission(userId: Long, hackathonId: int, submission: Submission, file: MultipartFile): Submission
    +saveSubmission(userId: Long, hackathonId: int, submission: Submission): Submission
    +editSubmission(...): Submission
}

class SubmissionServiceProxy {
    -realSubmissionService: SubmissionServiceImpl
    -lastSubmissionTime: Map<String, Long>
    +validateSubmission(userId: Long, hackathonId: int, submission: Submission, file: MultipartFile): Submission
    +saveSubmission(userId: Long, hackathonId: int, submission: Submission): Submission
    +editSubmission(...): Submission
    -checkRateLimit(userId: Long, hackathonId: int): void
}

SubmissionService <|.. SubmissionServiceImpl
SubmissionService <|.. SubmissionServiceProxy
SubmissionServiceProxy --> SubmissionServiceImpl

note right of SubmissionServiceProxy : Proxy adds rate limiting\nand validation chain\nbefore delegating to real service
note right of SubmissionServiceImpl : Real implementation\nof submission business logic

@enduml
```

### 13. Chain of Responsibility Pattern - Validation Chain

```plantuml
@startuml Chain_Responsibility_Validation
interface SubmissionValidator {
    +setNext(next: SubmissionValidator): void
    +validate(submission: Submission, file: MultipartFile): void
}

abstract class BaseValidator {
    #next: SubmissionValidator
    +setNext(next: SubmissionValidator): void
    +validate(submission: Submission, file: MultipartFile): void
    #{abstract} doValidate(submission: Submission, file: MultipartFile): void
}

class TitleValidator {
    #doValidate(submission: Submission, file: MultipartFile): void
}

class DescriptionValidator {
    #doValidate(submission: Submission, file: MultipartFile): void
}

class FileSizeValidator {
    #doValidate(submission: Submission, file: MultipartFile): void
}

class SubmissionServiceProxy {
    +validateSubmission(...): Submission
}

SubmissionValidator <|.. BaseValidator
BaseValidator <|-- TitleValidator
BaseValidator <|-- DescriptionValidator
BaseValidator <|-- FileSizeValidator
BaseValidator --> SubmissionValidator
SubmissionServiceProxy --> SubmissionValidator

note right of TitleValidator : Validates title\nrequirements
note right of DescriptionValidator : Validates description\nrequirements
note right of FileSizeValidator : Validates file size\nlimits
note right of BaseValidator : Abstract handler\ndefines chain structure

@enduml
```

### 14. Visitor Pattern - Analytics Collection

```plantuml
@startuml Visitor_Pattern_Analytics
interface AnalyticsVisitor {
    +visit(hackathon: Hackathon): void
    +visit(user: User): void
    +visit(team: Team): void
    +visit(submission: Submission): void
    +visit(judgeScore: JudgeScore): void
}

class AnalyticsCollector {
    -totalHackathons: int
    -totalUsers: int
    -totalTeams: int
    -totalSubmissions: int
    -totalJudgeScores: int
    +visit(hackathon: Hackathon): void
    +visit(user: User): void
    +visit(team: Team): void
    +visit(submission: Submission): void
    +visit(judgeScore: JudgeScore): void
    +getTotalHackathons(): int
    +getTotalUsers(): int
    +getTotalTeams(): int
    +getTotalSubmissions(): int
    +getTotalJudgeScores(): int
}

class Hackathon {
    +accept(visitor: AnalyticsVisitor): void
}

class User {
    +accept(visitor: AnalyticsVisitor): void
}

class Team {
    +accept(visitor: AnalyticsVisitor): void
}

class Submission {
    +accept(visitor: AnalyticsVisitor): void
}

class JudgeScore {
    +accept(visitor: AnalyticsVisitor): void
}

AnalyticsVisitor <|.. AnalyticsCollector
Hackathon --> AnalyticsVisitor
User --> AnalyticsVisitor
Team --> AnalyticsVisitor
Submission --> AnalyticsVisitor
JudgeScore --> AnalyticsVisitor

note right of AnalyticsCollector : Concrete visitor\ncollects statistics\nfrom different entities
note right of Hackathon : Element accepts\nvisitor and calls\nappropriate visit method

@enduml
```

### 15. Abstract Factory Pattern - Collection Factory

```plantuml
@startuml Abstract_Factory_Collections
interface Aggregate<T> {
    +createIterator(): Iterator<T>
}

class HackathonCollection {
    -hackathons: List<Hackathon>
    +createIterator(): Iterator<Hackathon>
}

class SubmissionCollection {
    -submissions: List<Submission>
    +createIterator(): Iterator<Submission>
}

class TeamCollection {
    -teams: List<Team>
    +createIterator(): Iterator<Team>
}

class CollectionFactory {
    -teamRepository: TeamRepository
    -submissionRepository: SubmissionRepository
    -hackathonRepository: HackathonRepository
    +hackathons(): HackathonCollection
    +submissions(team: Team, hackathon: Hackathon): SubmissionCollection
    +teams(hackathon: Hackathon): TeamCollection
}

Aggregate <|.. HackathonCollection
Aggregate <|.. SubmissionCollection
Aggregate <|.. TeamCollection
CollectionFactory --> HackathonCollection : creates
CollectionFactory --> SubmissionCollection : creates
CollectionFactory --> TeamCollection : creates

note right of CollectionFactory : Abstract Factory creates\nfamilies of related\ncollection objects
note right of HackathonCollection : Product family\nfor hackathon collections
note right of SubmissionCollection : Product family\nfor submission collections

@enduml
```

### 16. Repository Pattern - Data Access

```plantuml
@startuml Repository_Pattern_Data
interface SubmissionRepository {
    +findById(id: Long): Optional<Submission>
    +findByHackathonId(hackathonId: int): List<Submission>
    +findByUserId(userId: Long): List<Submission>
    +findByHackathonIdAndIsPrimaryTrue(hackathonId: int): List<Submission>
    +clearPrimaryForTeamInHackathon(teamId: Long, hackathonId: Long): void
    +save(submission: Submission): Submission
    +deleteById(id: Long): void
}

interface HackathonRepository {
    +findById(id: int): Optional<Hackathon>
    +findAll(): List<Hackathon>
    +save(hackathon: Hackathon): Hackathon
    +deleteById(id: int): void
}

interface UserRepository {
    +findById(id: Long): Optional<User>
    +findByEmail(email: String): Optional<User>
    +save(user: User): User
}

class SubmissionServiceImpl {
    -submissionRepository: SubmissionRepository
    -hackathonRepository: HackathonRepository
    -userRepository: UserRepository
    +saveSubmission(...): Submission
    +findByHackathonId(hackathonId: int): List<Submission>
}

SubmissionServiceImpl --> SubmissionRepository
SubmissionServiceImpl --> HackathonRepository
SubmissionServiceImpl --> UserRepository

note right of SubmissionRepository : Repository abstracts\ndata access for submissions\nProvides domain-specific queries
note right of SubmissionServiceImpl : Service layer uses\nrepositories for\ndata operations

@enduml
```

### 17. MVC Pattern - Web Architecture

```plantuml
@startuml MVC_Pattern_Architecture
package "Model" {
    class Submission {
        -id: Long
        -title: String
        -description: String
        -projectUrl: String
        -submitTime: Instant
    }
    
    class Hackathon {
        -id: Long
        -title: String
        -status: String
        -startDate: Instant
    }
    
    class User {
        -id: Long
        -username: String
        -email: String
    }
}

package "View" {
    class SubmissionController {
        +submitProject(request: SubmitProjectRequest): ResponseEntity
        +editSubmission(request: EditSubmissionRequest): ResponseEntity
        +listSubmissions(hackathonId: int): ResponseEntity
        +setPrimarySubmission(submissionId: Long): ResponseEntity
    }
    
    class HackathonController {
        +createHackathon(request: HackathonRequest): ResponseEntity
        +publishHackathon(hackathonId: int): ResponseEntity
        +getHackathonDetails(hackathonId: int): ResponseEntity
    }
}

package "Controller" {
    class SubmissionService {
        +saveSubmission(...): Submission
        +editSubmission(...): Submission
        +findByHackathonId(hackathonId: int): List<Submission>
        +setPrimarySubmission(...): Submission
    }
    
    class HackathonService {
        +createHackathon(...): Hackathon
        +publishHackathon(hackathonId: int): void
        +findById(hackathonId: int): Hackathon
    }
}

SubmissionController --> SubmissionService
HackathonController --> HackathonService
SubmissionService --> Submission
HackathonService --> Hackathon
SubmissionService --> User

note right of SubmissionController : View layer handles\nHTTP requests/responses\nand user interaction
note right of SubmissionService : Controller layer contains\nbusiness logic and\norchestrates operations
note right of Submission : Model layer represents\ndomain entities and\nbusiness data

@enduml
```

### 18. Dependency Injection Pattern - Spring Framework

```plantuml
@startuml Dependency_Injection_Spring
interface MailServiceAdapter {
    +sendMail(organizer: User, recipient: String, subject: String, body: String): void
}

class MailgunAdapter {
    +sendMail(organizer: User, recipient: String, subject: String, body: String): void
}

class SubmissionServiceImpl {
    -mailServiceAdapter: MailServiceAdapter
    -submissionRepository: SubmissionRepository
    -userRepository: UserRepository
    +saveSubmission(...): Submission
}

class SpringContainer {
    +getBean(clazz: Class): Object
    +autowire(target: Object): void
}

note as DIConfig
Spring Configuration:
@Component
@Service  
@Autowired
@ConditionalOnProperty

Spring automatically:
1. Creates bean instances
2. Injects dependencies
3. Manages lifecycle
4. Provides conditional loading
end note

SpringContainer ..> MailgunAdapter : creates & manages
SpringContainer ..> SubmissionServiceImpl : creates & manages
SpringContainer --> MailServiceAdapter : injects into
SubmissionServiceImpl --> MailServiceAdapter : uses injected
DIConfig .. SpringContainer

note right of SubmissionServiceImpl : Dependencies are injected\nby Spring container\nNot created manually
note right of SpringContainer : IoC Container manages\nobject creation and\ndependency resolution

@enduml
```

## Complete Pattern Count: 18 Design Patterns ✅

### **Behavioral Patterns (8):**
1. **Observer** - Hackathon notifications
2. **Strategy** - Email provider selection 
3. **Template Method** - Scoreboard generation
4. **Chain of Responsibility** - Validation chain
5. **Memento** - Submission history
6. **Visitor** - Analytics collection
7. **Iterator** - Collection traversal
8. **State** - Hackathon lifecycle

### **Creational Patterns (4):**
9. **Builder** - Submission construction
10. **Factory** - Role creation
11. **Abstract Factory** - Collection factory
12. **Dependency Injection** - Spring IoC

### **Structural Patterns (6):**
13. **Adapter** - Email service unification
14. **Decorator** - Enhanced notifications
15. **Proxy** - Validation & rate limiting
16. **Repository** - Data access abstraction
17. **MVC** - Architectural pattern
18. **Null Object** - No-op implementations
</rewritten_file> 