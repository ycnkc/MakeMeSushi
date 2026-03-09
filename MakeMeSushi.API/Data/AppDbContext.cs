using MakeMeSushi.Models;
using Microsoft.EntityFrameworkCore;

namespace MakeMeSushi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<PomodoroSession> PomodoroSessions {get; set;}
        public DbSet<Inventory> Inventory { get; set; }
 
        protected override void OnModelCreating(ModelBuilder modelBuilder) 
        {
            modelBuilder.Entity<PomodoroSession>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId);

            modelBuilder.Entity<Inventory>()
            .HasOne(i => i.User)
            .WithMany()
            .HasForeignKey(i => i.UserId);

            base.OnModelCreating(modelBuilder);

        }
    }
}
