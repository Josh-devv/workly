using Microsoft.EntityFrameworkCore;
using Workly.Api.Models;

namespace Workly.Api.Data;

public class WorklyDbContext(
    DbContextOptions<WorklyDbContext> options
) : DbContext(options)
{
    public DbSet<Clients> Client => Set<Clients>();
    public DbSet<Projects> Project => Set<Projects>();
    public DbSet<Organizations> Organization => Set<Organizations>();
    public DbSet<Users> User => Set<Users>();
    public DbSet<OrgInvitations> OrgInvitation => Set<OrgInvitations>();
    public DbSet<OrgMembers> OrgMember => Set<OrgMembers>();
    public DbSet<Tasks> Task => Set<Tasks>();
    public DbSet<TimeEntries> TimeEntry => Set<TimeEntries>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

       
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Clients>(entity =>
        {
            entity.Property(c => c.Id)
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(c => c.Created_At)
                .HasDefaultValueSql("now()");

            entity.Property(c => c.Updated_At)
                .HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<Organizations>(entity =>
        {
            entity.Property(c => c.Id)
                .HasDefaultValueSql("gen_random_uuid()");

            entity.Property(c => c.Created_At)
                .HasDefaultValueSql("now()");
        });
    }
}