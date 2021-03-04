import { TeddyRequestContext } from './types';
import {
  body,
  request,
  summary,
  prefix,
  securityAll,
  tagsAll,
  responses,
  operation,
} from '@callteddy/koa-swagger-decorator';
import {
  ContractorProfile,
  ContractorProfileUpdateAttributes,
} from '../models/contractor_profile.model';

type BodyParameter = {
  type: 'string' | 'number';
  description: string;
};

const updateAttributes: Record<
  keyof ContractorProfileUpdateAttributes,
  BodyParameter
> = {
  company_name: {
    type: 'string',
    description: "the service provider's legal entity",
  },
  license_number: {
    type: 'string',
    description: "the service provider's professional license number",
  },
  licensing_state: {
    type: 'string',
    description: "the state that issued the service provider's license",
  },
  primary_work: {
    type: 'string',
    description:
      "the service provider's primary area of expertise, currently limited to one of the following: electrical, hvac, plumbing, carpentry, or handiwork",
  },
  appointment_fee: {
    type: 'number',
    description: 'a flat rate per appointment',
  },
  daily_rate: {
    type: 'number',
    description: 'a rate charged per day',
  },
  hourly_rate: {
    type: 'number',
    description: 'a rate charged per hour',
  },
  estimated_yearly_income: {
    type: 'number',
    description: "the provider's estimated yearly earnings, before expenses",
  },
  estimated_yearly_expenses: {
    type: 'number',
    description: "the provider's estimated yearly expenses",
  },
};

@prefix('/contractor_profile')
@securityAll([{ token: [] }])
@tagsAll(['contractorProfile'])
export class ContractorProfileAPI {
  @request('put', '')
  @operation('apiContractorProfile_update')
  @summary(
    'update the logged in contractor profile with a subset of valid fields',
  )
  @body(updateAttributes)
  @responses({
    204: {
      description: 'Success',
    },
    401: {
      description: 'Unauthorized',
    },
  })
  // eslint-disable-next-line sonarjs/cognitive-complexity
  public static async updateContractorProfile(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }
    const user_id = ctx.user.id;

    const {
      company_name,
      license_number,
      licensing_state,
      primary_work,
      appointment_fee,
      daily_rate,
      hourly_rate,
      estimated_yearly_income,
      estimated_yearly_expenses,
    } = ctx.request.body as Partial<ContractorProfileUpdateAttributes>;

    const [profile] = await ContractorProfile.findOrCreate({
      where: {
        user_id,
      },
    });

    if (company_name) {
      profile.company_name = company_name;
    }
    if (license_number) {
      profile.license_number = license_number;
    }
    if (licensing_state) {
      profile.licensing_state = licensing_state;
    }
    if (primary_work) {
      profile.primary_work = primary_work;
    }
    if (appointment_fee) {
      profile.appointment_fee = appointment_fee;
    }
    if (hourly_rate) {
      profile.hourly_rate = hourly_rate;
    }
    if (daily_rate) {
      profile.daily_rate = daily_rate;
    }
    if (estimated_yearly_expenses) {
      profile.estimated_yearly_expenses = estimated_yearly_expenses;
    }
    if (estimated_yearly_income) {
      profile.estimated_yearly_income = estimated_yearly_income;
    }

    await profile.save();

    ctx.status = 204;
  }
}
