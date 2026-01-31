using System.Security.Claims;
using FluentResults;
using ReWear.Dtos.Request.DeliveryBox;
using ReWear.Dtos.Response.DeliveryBox;
using ReWear.Models.Enums;

namespace ReWear.Services.ModelServices.DeliveryBoxService;

public interface IDeliveryBoxService
{
    Task<Result<DeliveryBoxPreviewResponseDto>> Create(ClaimsPrincipal claims);

    Task<Result<IEnumerable<DeliveryBoxPreviewResponseDto>>> GetPreviews(
        ClaimsPrincipal claims,
        CancellationToken ct
    );
    Task<Result<FullDeliveryBoxResponseDto>> GetLatest(
        ClaimsPrincipal claims,
        CancellationToken ct
    );
    Task<Result<IEnumerable<AdminBoxResponseDto>>> GetAllAdmin(CancellationToken ct);
    Task<Result<FullAdminBoxResponseDto>> GetByIdAdmin(Guid boxId, CancellationToken ct);

    Task<Result> AddItemToLatestBox(ClaimsPrincipal claims, Guid clothingItemId, string size);
    Task<Result> RemoveItem(ClaimsPrincipal claims, Guid inventoryItemId);

    // returns the inventory item id of the new item
    Task<Result<Guid>> ChangeItemSize(ClaimsPrincipal claims, ChangeBoxItemSizeRequestDto request);

    Task<Result> FillLatestBoxWithAI(ClaimsPrincipal claims);

    Task<Result> Send(ClaimsPrincipal claims);

    Task<Result> UpdateStatus(Guid boxId, DeliveryBoxStatus newStatus);

    Task<Result> AdminDelete(Guid boxId);
}
