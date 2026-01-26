using ReWear.Models.Enums;

namespace ReWear.Dtos.Request.User;

public class SetupAccountRequestDto
{
    public Gender Gender { get; set; }

    public Style PrimaryStyle { get; set; }
    public IEnumerable<Style> SecondaryStyles { get; set; } = [];

    public Season SeasonPreference { get; set; }

    public IEnumerable<Color> PreferredColors { get; set; } = [];
    public IEnumerable<Color> AvoidedColors { get; set; } = [];

    public Fit FitPreference { get; set; }

    public IEnumerable<CreateUserSizeRequestDto> Sizes { get; set; } = null!;

    public IEnumerable<Material> AvoidedMaterials { get; set; } = [];

    public int SubscriptionPlanId { get; set; }
}
