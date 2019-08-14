function template(strings, ...keys) {
  return ((...values) => {
    const dict = values[values.length - 1] || {};
    const result = [strings[0]];
    keys.forEach((key, i) => {
      const value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  });
}

const targetDetail = template`
select u.id, u.first_name, u.last_name, u.mobile_no,
  sum(case when dt.vehicle_type = 0 then dt.target_value else 0 end) bike,
  sum(case when dt.vehicle_type = 1 then dt.target_value else 0 end) scooter,
  sum(dt.target_value) as total_target,
  0 as avg_target_completion,
  ((sum(achieved_value)*100)/sum(target_value)) as last_month_target_completion
from
  users as u
  left join dealer_targets as dt on dt.dealer_sales_id=u.id
      and dt.from_date >= $1 and dt.to_date < $2
where
  u.user_type_id = $3 and u.is_active = true and u.id in (${'dealerUserIds'})

group by dt.dealer_sales_id, u.id
`;

const targetCompletion = template`
  SELECT cm_targets.user_id, cm_targets.first_name, cm_targets.last_name, cm_targets.is_active, cm_targets.bike,
  cm_targets.scooter, cm_targets.total_target, lm_targets.last_month_achieved as last_month_achieved,
  lm_targets.last_month_target as last_month_target, ly_targets.last_year_achieved as last_year_achieved,
  ly_targets.last_year_target as last_year_target from
  (select u.id as user_id, u.first_name as first_name, u.last_name as last_name, is_active as is_active,
  sum(case when dt.vehicle_type = 0 then dt.target_value else 0 end) bike,
  sum(case when dt.vehicle_type = 1 then dt.target_value else 0 end) scooter,
  sum(dt.target_value) as total_target, sum(dt.achieved_value) as target_completion
   FROM users AS u
  LEFT JOIN dealer_targets as dt on dt.dealer_sales_id=u.id
  and dt.from_date >= $2 and dt.to_date <= $3
  where u.user_type_id = $1 AND u.id in (${'dealerUserIds'})
  group by dt.dealer_sales_id, u.id) as cm_targets
  INNER JOIN (
  select u.id as user_id, sum(dt.achieved_value) as last_month_achieved, sum(dt.target_value) as last_month_target
  from users as u
  LEFT JOIN dealer_targets as dt on dt.dealer_sales_id=u.id
  AND dt.from_date >= $4 and dt.to_date <= $5
  WHERE u.user_type_id = $1 and u.id in (${'dealerUserIds'})
  GROUP BY dt.dealer_sales_id, u.id) as lm_targets on lm_targets.user_id = cm_targets.user_id
  INNER JOIN (
  SELECT u.id as user_id, sum(dt.achieved_value) as last_year_achieved, sum(dt.target_value) as last_year_target
  FROM users AS u
  LEFT JOIN dealer_targets AS dt ON dt.dealer_sales_id=u.id
  WHERE u.user_type_id = $1 AND u.id in (${'dealerUserIds'})
  GROUP BY dt.dealer_sales_id, u.id) AS ly_targets ON ly_targets.user_id = cm_targets.user_id
`;

const names = template`
  SELECT distinct(name),from_date,to_date FROM dealer_targets
  WHERE dealer_id = $1 and from_date::timestamp::date >= $2 and
  to_date::timestamp::date <= $3 ORDER BY from_date desc `;

module.exports.targetDetail = targetDetail;
module.exports.targetCompletion = targetCompletion;
module.exports.names = names;
