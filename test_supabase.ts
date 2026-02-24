import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqqhdboaxuroebbkbycs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcWhkYm9heHVyb2ViYmtieWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzODgwOTcsImV4cCI6MjA4NTk2NDA5N30.f5UMrrCn4mzi9pDgdey-1MfTtWOhX_knNuq8rIKb5No';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    console.log("Iniciando teste de inserção...");
    const { data, error } = await supabase
        .from('appointments')
        .insert({
            patient_name: 'Teste Automático',
            whatsapp: '5511999999999',
            date_time: new Date().toISOString(),
            session_type: 'Avaliação',
            status: 'PENDENTE',
            is_viewed: true
        })
        .select();

    if (error) {
        console.error("Erro no teste de inserção:", error);
    } else {
        console.log("Sucesso! Registro criado:", data);
        // Limpeza
        const { error: delError } = await supabase
            .from('appointments')
            .delete()
            .eq('id', data[0].id);
        if (delError) console.error("Erro ao deletar teste:", delError);
        else console.log("Teste deletado com sucesso.");
    }
}

testInsert();
