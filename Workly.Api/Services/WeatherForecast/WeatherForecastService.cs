using Workly.Api.Dtos;

namespace Workly.Api.Services.WeatherForecast;

public sealed class WeatherForecastService : IWeatherForecastService
{
    private static readonly string[] Summaries =
    [
        "Freezing", "Bracing", "Chilly", "Cool", "Mild",
        "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    ];

    public IReadOnlyList<WeatherForecastDto> GetForecasts() =>
        Enumerable.Range(1, 5)
            .Select(index => new WeatherForecastDto(
                DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                Random.Shared.Next(-20, 55),
                Summaries[Random.Shared.Next(Summaries.Length)]))
            .ToArray();
}
