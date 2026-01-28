using System.Security.Claims;
using FluentResults;
using ReWear.Dtos.Response.DeliveryBox;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public interface IDeliveryBoxService
{
    Task<Result<DeliveryBoxPreviewResponseDto>> Create(ClaimsPrincipal claims);

    Task<Result<IEnumerable<DeliveryBoxPreviewResponseDto>>> GetPreviews(ClaimsPrincipal claims);
}
