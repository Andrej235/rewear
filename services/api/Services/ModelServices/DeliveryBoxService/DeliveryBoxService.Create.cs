using System.Security.Claims;
using FluentResults;
using ReWear.Dtos.Response.DeliveryBox;
using ReWear.Errors;
using ReWear.Models;
using ReWear.Services.Read;
using ReWear.Utilities;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public partial class DeliveryBoxService
{
    public async Task<Result<DeliveryBoxPreviewResponseDto>> Create(ClaimsPrincipal claims)
    {
        var userId = userManager.GetUserId(claims);
        if (userId is null)
            return Result.Fail<DeliveryBoxPreviewResponseDto>("User not found");

        var unfinishedBox = await readService.Get(
            x => new { x.Month },
            x => x.UserId == userId && x.Status == Models.Enums.DeliveryBoxStatus.None
        );

        if (unfinishedBox.IsSuccess)
        {
            return Result.Fail(
                new BadRequest(
                    $"You already have an unfinished delivery box for {unfinishedBox.Value.Month:MMMM}"
                )
            );
        }

        var latestBox = await readRangeService.Get(
            x => x.Month,
            x => x.UserId == userId,
            0,
            1,
            q => q.OrderByDescending(b => b.Month)
        );

        var newBoxMonth =
            latestBox.IsSuccess && latestBox.Value.Any()
                ? latestBox.Value.First().AddMonths(1)
                : DateOnly.FromDateTime(DateTime.UtcNow).AddDays(30 - DateTime.UtcNow.Day + 1);

        var newBox = new DeliveryBox
        {
            CreatedAt = DateTime.UtcNow.AsUTC(),
            Month = newBoxMonth,
            Status = Models.Enums.DeliveryBoxStatus.None,
            UserId = userId,
            SentAt = null,
            ReturnedAt = null,
        };

        var createdBoxResult = await createService.Add(newBox);
        if (createdBoxResult.IsFailed)
            return Result.Fail<DeliveryBoxPreviewResponseDto>(createdBoxResult.Errors);

        var createdBox = createdBoxResult.Value;
        return new DeliveryBoxPreviewResponseDto
        {
            Id = createdBox.Id,
            Month = createdBox.Month,
            Status = createdBox.Status,
            ItemCount = 0,
        };
    }
}
