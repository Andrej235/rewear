using ReWear.Dtos.Request.ClothingItem;
using ReWear.Models;
using ReWear.Utilities;

namespace ReWear.Services.Mapping.Request.ClothingItemMappers;

public class CreateClothingItemRequestMapper
    : IRequestMapper<CreateClothingItemRequestDto, ClothingItem>
{
    public ClothingItem Map(CreateClothingItemRequestDto from) =>
        new()
        {
            Name = from.Name,
            Description = from.Description,
            ImageUrl = "", // ImageUrl will be set after uploading the image

            Category = from.Category,
            GenderTarget = from.GenderTarget,

            PrimaryStyle = from.PrimaryStyle,
            SecondaryStyles = from.SecondaryStyles.ParseFlags(),

            Colors = from.Colors.ParseFlags(),
            FitType = from.FitType,
            Season = from.Season,

            Material = from.Material,
            BrandName = from.BrandName,

            IsActive = from.IsActive,
            CreatedAt = DateTime.UtcNow.AsUTC(),

            InInventory = [],
        };
}
