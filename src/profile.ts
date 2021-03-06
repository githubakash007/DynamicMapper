import { AutoMappingExpression } from './configuration/auto-mapping-expression';
import { MappingExpressionBase } from './configuration/mapping-expression-base';
import {
    AutoMappableProperties, ExplicitProperties, IMemberConfigurationExpression,
    IProfileExpression,
    ITypeMapConfiguration,
    MappingMembers, NormalizeIntersection,
    ValueTransformer
} from './interface';
import { IAutoMappingExpression, IMappingExpression, IProfileConfiguration } from './configuration/interface';
import { MappingPair } from './mapping-pair';
import { MappingExpression } from './configuration/mapping-expression';

export abstract class Profile implements IProfileExpression, IProfileConfiguration {
    readonly typeMapConfigs: ITypeMapConfiguration[] = [];

    readonly valueTransformers: ValueTransformer[] = [];

    public profileName: string;

    createAutoMap<TSource, TDestination>(
        pair: MappingPair<TSource, TDestination>,
        members: NormalizeIntersection<
                    Partial<AutoMappableProperties<TSource, TDestination>> &
                    Required<ExplicitProperties<TSource, TDestination>>>
    ): IAutoMappingExpression<TSource, TDestination> {
        return this.configureMappingExpression(
            new AutoMappingExpression<TSource, TDestination>(pair),
            members as Partial<MappingMembers<TSource, TDestination>>
        );
    }

    createMap<TSource, TDestination>(
        pair: MappingPair<TSource, TDestination>,
        config: Partial<MappingMembers<TSource, TDestination>> = {}
    ): IMappingExpression<TSource, TDestination> {
        return this.configureMappingExpression(new MappingExpression<TSource, TDestination>(pair), config);
    }

    createStrictMap<TSource, TDestination>(
        pair: MappingPair<TSource, TDestination>,
        config: Required<MappingMembers<TSource, TDestination>>,
        allMemberConfig?: (opt: IMemberConfigurationExpression<TSource, TDestination, any>) => void
    ): IMappingExpression<TSource, TDestination> {
        return this.configureMappingExpression(
            new MappingExpression<TSource, TDestination>(pair), config, allMemberConfig);
    }

    private configureMappingExpression<
        TExpression extends MappingExpressionBase<TSource, TDestination>, TSource, TDestination
    >(
        expression: TExpression,
        config: Partial<MappingMembers<TSource, TDestination>>,
        allMemberConfig?: (opt: IMemberConfigurationExpression<TSource, TDestination, any>) => void
    ): TExpression {
        for (const member of Object.keys(config)) {
            if (allMemberConfig) {
                expression.forMember(member as keyof TDestination, allMemberConfig);
            }

            expression.forMember(member as keyof TDestination, (config as any)[member]);
        }

        this.typeMapConfigs.push(expression);

        return expression;
    }
}
