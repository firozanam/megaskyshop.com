import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const FormInput = ({ label, id, ...props }) => {
    return (
        <div>
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} {...props} />
        </div>
    )
}

export default FormInput
