using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace main.Context;

public class myContext:DbContext
{
    public myContext (DbContextOptions<myContext> options):base(options)
    {

    }
    public DbSet<Persons> Persons { get; set; }
    public DbSet<TestModel> TestModel { get; set; }
    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<TestModel>().HasNoKey();
    }
}
public class TestModel
{
    public int Id { get; set; }
    public string? Lastname { get; set; }
}

[Table("PERSONS")]
public class Persons
{
    [Column("PERSONID")]
    public int Id { get; set; }
    [Column("LASTNAME")]
    public string? Lastname { get; set; }
}

