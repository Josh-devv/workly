
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Workly.Api.Data;
using Workly.Api.Services.Client;
using Workly.Api.Services.OrgInvitation;
using Workly.Api.Services.OrgMember;
using Workly.Api.Services.Organization;
using Workly.Api.Services.Project;
using Workly.Api.Services.Tasks;
using Workly.Api.Services.TimeEntry;
using Workly.Api.Services.User;
using Workly.Api.Services.WeatherForecast;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<WorklyDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);
builder.Services.AddScoped<IClientService, ClientService>();
builder.Services.AddScoped<IOrgInvitationService, OrgInvitationService>();
builder.Services.AddScoped<IOrgMemberService, OrgMemberService>();
builder.Services.AddScoped<IOrgService, OrgService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ITimeEntryService, TimeEntryService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<IWeatherForecastService, WeatherForecastService>();

// Authentication: validate Supabase access tokens
//installing NutGet Package dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
//then dotnet build
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority =
            "https://vsjoztuphvyocszhzgoa.supabase.co/auth/v1";

        options.Audience = "authenticated";

        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                NameClaimType = "sub"
            };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();



//the program.cs configures JWT authentication, ASP.NET Core validates the Supabase Token

//401 Unauthtorizaed: means teh request wasnt generated successfuly
//403 forbidden means the caller is autheticated but isnt permitted to perform requested action
//404 Not FOund means when a client doesnt exists or isnt accecible to the user