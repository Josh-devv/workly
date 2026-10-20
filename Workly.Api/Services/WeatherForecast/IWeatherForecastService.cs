using Workly.Api.Dtos;

namespace Workly.Api.Services.WeatherForecast;

public interface IWeatherForecastService
{
    IReadOnlyList<WeatherForecastDto> GetForecasts();
}
