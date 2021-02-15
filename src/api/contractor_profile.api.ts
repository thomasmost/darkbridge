import Router from 'koa-router';
import {
  ContractorProfile,
  ContractorProfileAttributes,
} from '../models/contractor_profile.model';
import { TeddyRequestContext } from './types';

export const contractorProfileAPI = new Router();

// eslint-disable-next-line sonarjs/cognitive-complexity
export async function updateContractorProfile(ctx: TeddyRequestContext) {
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
  } = ctx.request.body as Partial<ContractorProfileAttributes>;

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

contractorProfileAPI.put('/', updateContractorProfile);
