using System.Security.Claims;
using FluentResults;
using ReWear.Dtos.Response.ClothingItem;
using ReWear.Dtos.Response.DeliveryBox;
using ReWear.Services.Read;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public partial class DeliveryBoxService
{
    public Task<Result<IEnumerable<DeliveryBoxPreviewResponseDto>>> GetPreviews(
        ClaimsPrincipal claims,
        CancellationToken ct
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
            x => x.UserId == userId,
            cancellationToken: ct
        );
    }

    public async Task<Result<FullDeliveryBoxResponseDto>> GetLatest(
        ClaimsPrincipal claims,
        CancellationToken ct
    )
    {
        var userId = userManager.GetUserId(claims);
        if (userId is null)
            return Result.Fail("User not found");

        var result = await readRangeService.Get(
            x => new FullDeliveryBoxResponseDto
            {
                Id = x.Id,
                Month = x.Month,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                ReturnedAt = x.ReturnedAt,
                SentAt = x.SentAt,
                Items = x.Items.Select(i => new DeliveryBoxItemResponseDto
                {
                    ChosenByAi = i.ChosenByAi,
                    InventoryItem = new InventoryItemResponseDto
                    {
                        Id = i.InventoryItemId,
                        Category = i.InventoryItem.Category,
                        TopSize = i.InventoryItem.TopSize,
                        BottomWaistSize = i.InventoryItem.BottomWaistSize,
                        BottomLengthSize = i.InventoryItem.BottomLengthSize,
                        ShoeSize = i.InventoryItem.ShoeSize,
                    },
                    ClothingItem = new ClothingItemPreviewResponseDto
                    {
                        Id = i.InventoryItem.ClothingItemId,
                        Name = i.InventoryItem.ClothingItem.Name,
                        Description = i.InventoryItem.ClothingItem.Description,
                        ImageUrl = i.InventoryItem.ClothingItem.ImageUrl,
                    },
                }),
            },
            x => x.UserId == userId,
            0,
            1,
            q => q.OrderByDescending(b => b.Month),
            ct
        );

        if (result.IsFailed || !result.Value.Any())
            return Result.Fail("No delivery boxes found");

        return result.Value.First();
    }
}
