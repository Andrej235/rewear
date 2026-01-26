using ReWear.Models.Enums;

namespace ReWear.Dtos.Request.User;

public class CreateUserSizeRequestDto
{
    public SizeType SizeType { get; set; }
    public string Label { get; set; } = null!;
}
