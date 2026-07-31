/**
 * LUI PC3.0 状态标签色：
 * 蓝=待完成/待审批，橙=进行中/审批中，红=异常/驳回，灰=失效，绿=已完成
 */
const STATUS_TAG_MAP = {
  // 绿 · 已完成
  已完成: 'success',
  已启用: 'success',
  启用: 'success',
  // 红 · 异常/驳回
  异常: 'danger',
  驳回: 'danger',
  已驳回: 'danger',
  已停用: 'danger',
  停用: 'danger',
  // 橙 · 进行中/审批中
  进行中: 'warning',
  审批中: 'warning',
  // 灰 · 失效
  失效: 'info',
  已失效: 'info',
  // 蓝 · 待完成/待审批
  待完成: 'primary',
  待审批: 'primary'
}

export function statusTagType(status) {
  return STATUS_TAG_MAP[status] || 'info'
}
