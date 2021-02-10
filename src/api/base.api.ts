import Koa from 'koa';
import { Model } from 'sequelize';

export function getById<TModel extends Model>(model: {
  findByPk(pk: string): Promise<TModel>;
}) {
  return async function (ctx: Koa.ParameterizedContext) {
    const id = ctx.params.id;
    const instance = await model.findByPk(id);
    if (!instance) {
      ctx.status = 404;
      return;
    }
    ctx.body = instance;
    ctx.status = 200;
  };
}

// export async function getById(
//   ctx: Koa.ParameterizedContext,
//   model: typeof Model,
// ) {
//   const id = ctx.params.id;
//   const appointment = await model.findByPk(id);
//   ctx.status = 200;
// }
