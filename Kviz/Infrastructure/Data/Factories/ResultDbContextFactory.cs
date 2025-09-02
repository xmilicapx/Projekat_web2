using Infrastructure.Data.Contexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Data.Factories
{
    public class ResultDbContextFactory : IDesignTimeDbContextFactory<ResultDbContext>
    {
        public ResultDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            var connectionString = configuration.GetConnectionString("DatabaseConnectionString");
            var optionsBuilder = new DbContextOptionsBuilder<ResultDbContext>();
            optionsBuilder.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString));

            return new ResultDbContext(optionsBuilder.Options);
        }
    }
}
