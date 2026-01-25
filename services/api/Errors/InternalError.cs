using FluentResults;

namespace ReWear.Errors;

public class InternalError(string message) : Error(message) { }
