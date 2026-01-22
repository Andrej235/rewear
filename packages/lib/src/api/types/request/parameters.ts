import { ParseSchemaProperty } from "../schema/property-parser";
import { Paths } from "../spec/endpoints";

type ParseParameters<ParametersInfo> = ParametersInfo extends [
  infer First,
  ...infer Rest,
]
  ? (First extends {
      required: infer Required;
    }
      ? ParseParameter<First, Required>
      : ParseParameter<First, false>) &
      ParseParameters<Rest>
  : object;

type ParseParameter<Parameter, Required> = Required extends true
  ? {
      [key in keyof Parameter as key extends "name"
        ? Parameter[key] extends string
          ? Parameter[key]
          : never
        : never]: ParameterType<Parameter>;
    }
  : {
      [key in keyof Parameter as key extends "name"
        ? Parameter[key] extends string
          ? Parameter[key]
          : never
        : never]?: ParameterType<Parameter>;
    };

type ParameterType<Parameter> = Parameter extends { schema: infer Schema }
  ? ParseSchemaProperty<Schema>
  : never;

export type RequestParameters<
  Path extends keyof Paths,
  Method extends keyof Paths[Path],
> = "parameters" extends keyof Paths[Path][Method]
  ? Paths[Path][Method]["parameters"] extends object[]
    ? {
        parameters: ParseParameters<Paths[Path][Method]["parameters"]>;
      }
    : object
  : object;
