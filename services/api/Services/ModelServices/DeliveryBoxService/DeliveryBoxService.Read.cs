using System.Security.Claims;
using FluentResults;
using ReWear.Dtos.Response.DeliveryBox;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public partial class DeliveryBoxService
{
    public Task<Result<IEnumerable<DeliveryBoxPreviewResponseDto>>> GetPreviews(
        ClaimsPrincipal claims
    )
    {
        var userId = userManager.GetUserId(claims);
        if (userId is null)
            return Task.FromResult(
                Result.Fail<IEnumerable<DeliveryBoxPreviewResponseDto>>("User not found")
            );

        return readRangeService.Get(
            x => new DeliveryBoxPreviewResponseDto
            {
                Id = x.Id,
                Month = x.Month,
                Status = x.Status,
                ItemCount = x.Items.Count,
            },
            x => x.UserId == userId
        );
    }
}
