type UnwrapArrayString<T extends string, A extends unknown[] = []> =
 T extends '' ? A :
        T extends `{${infer K}:[${infer U}]},${infer C}` ? 
            UnwrapArrayString<C, [...A, JsonToTS<`{${K}:[${U}]}`>]> :
        T extends `{${infer B}},${infer C}` ? 
                UnwrapArrayString<C, [...A, JsonToTS<`{${B}}`>]> :
        T extends `${infer B},${infer C}` ? 
                UnwrapArrayString<C, [...A, JsonToTS<B>]> :
        [...A, JsonToTS<T>]

type FormatString<T extends string> = T extends `${infer N extends number}` ? N : T extends `${infer N extends boolean}` ? N : T extends `'${infer N}'` ? N : T

type JsonToTS<T extends string> = 
    TrimString<T> extends infer Trimed ? 
        Trimed extends `{${infer Key}:${infer Value}}`
            ? { [K in Key]: JsonToTS<Value> }
            : Trimed extends `[${infer Value}]`
            ? UnwrapArrayString<Value>
            : FormatString<T> 
        : never

type TrimString<T extends string> = T extends `${infer A} ${infer B}` ? TrimString<`${A}${B}`> : T

const obj = { $and: [{ $eq: ['id', 1] }, { $or: [{ $eq: ['id', 2] }, { $gt: ['id', 3 ]}] }] }

const t: JsonToTS<`{ $and: [{ $eq: ['id', 1] }, { $or: [{ $eq: ['id', 2] }, { $gt: ['id', 3 ]}] }] }`> = {
    $and: [{
        $eq: ['id', 1]
    }, {
        $or: [{
            $eq: ['id', 2]
        }, {
            $gt: ['id', 3]
        }]
    }]
}

type Ensure<T, U> = T extends U ? T : never

type Truc<T, K> = T[Ensure<K, keyof T>] 