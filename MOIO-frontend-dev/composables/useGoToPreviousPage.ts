export default function useGoToPreviousPage(isLoading: Ref<boolean>) {
    isLoading.value = false
    const router = useRouter()
    // проверяем есть ли предыдущая страница
    if (document.referrer) {
        router.back()
    } else {
        router.push('/')
    }
}