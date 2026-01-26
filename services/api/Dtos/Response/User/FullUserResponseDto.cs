using ReWear.Models.Enums;

namespace ReWear.Dtos.Response.User;

public class FullUserResponseDto : UserResponseDto
{
    public Gender Gender { get; set; }

    public Style PrimaryStyle { get; set; }
    public Style SecondaryStyles { get; set; }

    public Season SeasonPreference { get; set; }

    public Color PreferredColors { get; set; }
    public Color AvoidedColors { get; set; }

    public Fit FitPreference { get; set; }

    public IEnumerable<UserSizeResponseDto> Sizes { get; set; } = null!;

    public Material AvoidedMaterials { get; set; }
}
