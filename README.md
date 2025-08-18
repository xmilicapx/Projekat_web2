# Projekat_web2
## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js (LTS)](https://nodejs.org/)
- Entity Framework Core CLI

Install EF tools if not already installed:

```bash
dotnet tool install --global dotnet-ef
````

---

## API Setup

### 1. Navigate to the solution root

```bash
cd path/to/project
```

### 2. Restore dependencies

```bash
dotnet restore
```

### 3. Apply Migrations

We have **three separate DbContexts**:

* `UserDbContext`
* `QuizDbContext`
* `ResultDbContext`

#### A. Open Package Manager Console

In **Visual Studio**:
`View` → `Other Windows` → `Package Manager Console`

#### B. Run the following commands

```powershell
cd .\Infrastructure
```

##### User DB:

```powershell
dotnet ef migrations add Users1 -c UserDbContext -o Data/Migrations/Users
dotnet ef database update -c UserDbContext
```

##### Quiz DB:

```powershell
dotnet ef migrations add Quiz1 -c QuizDbContext -o Data/Migrations/Quizzes
dotnet ef database update -c QuizDbContext
```

##### Result DB:

```powershell
dotnet ef migrations add Result1 -c ResultDbContext -o Data/Migrations/Results
dotnet ef database update -c ResultDbContext
```

---

## Client Setup

```bash
cd KvizUI
npm install
npm run dev
```

---

## Notes

* Migrations are organized in separate folders under `Infrastructure/Data/Migrations`.
* Each DbContext has a corresponding factory class to support CLI operations.