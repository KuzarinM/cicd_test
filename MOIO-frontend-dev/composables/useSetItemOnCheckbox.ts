export default function useSetItemOnCheckbox (isChecked:boolean, target: { id:string, name:string, type:string, capabilities:any}[], data:{ id: string, name:string, type:string, capabilities:any}) {
  const isSelected = target?.find(el => el?.id === data.id)
  if (isChecked && !isSelected) {
    target?.push(data)
  }
  if (!isChecked && isSelected) {
    const idx = target.findIndex(el => el.id === data.id)
    target?.splice(idx, 1)
  }
}
