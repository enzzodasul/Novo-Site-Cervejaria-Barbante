from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql

app = Flask(__name__)

print("APP CARREGADO")

CORS(app)

# =====================================
# CONEXÃO MYSQL
# =====================================

def conectar():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="barbante123",
        database="barbante",
        cursorclass=pymysql.cursors.DictCursor
    )

# =====================================
# HOME
# =====================================

@app.route("/")
def home():
    return "API Barbante funcionando!"

# =====================================
# NOVO PEDIDO
# =====================================

@app.route("/novo-pedido", methods=["POST"])
def novo_pedido():

    try:

        dados = request.json

        numero_mesa = dados.get("mesa")
        observacao = dados.get("observacao", "")
        itens = dados.get("itens", [])

        if not numero_mesa:
            return jsonify({
                "sucesso": False,
                "erro": "Mesa não informada"
            }), 400

        if len(itens) == 0:
            return jsonify({
                "sucesso": False,
                "erro": "Carrinho vazio"
            }), 400

        conexao = conectar()
        cursor = conexao.cursor()

        cursor.execute(
            "SELECT * FROM mesas WHERE numero = %s",
            (numero_mesa,)
        )

        mesa = cursor.fetchone()

        if not mesa:

            cursor.close()
            conexao.close()

            return jsonify({
                "sucesso": False,
                "erro": "Mesa não encontrada"
            }), 404

        total = 0

        for item in itens:

            preco = float(item.get("preco", 0))
            quantidade = int(item.get("quantidade", 1))

            total += preco * quantidade

        cursor.execute("""
            INSERT INTO pedidos
            (
                mesa_id,
                numero_mesa,
                observacao,
                total,
                status
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                'novo'
            )
        """,
        (
            mesa["id"],
            numero_mesa,
            observacao,
            total
        ))

        pedido_id = cursor.lastrowid

        for item in itens:

            nome = item.get("nome", "")
            preco = float(item.get("preco", 0))
            quantidade = int(item.get("quantidade", 1))
            subtotal = preco * quantidade

            cursor.execute("""
                INSERT INTO pedido_itens
                (
                    pedido_id,
                    produto,
                    quantidade,
                    preco,
                    subtotal
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
            """,
            (
                pedido_id,
                nome,
                quantidade,
                preco,
                subtotal
            ))

        cursor.execute("""
            UPDATE mesas
            SET status='ocupada'
            WHERE id=%s
        """, (mesa["id"],))

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({
            "sucesso": True,
            "pedido_id": pedido_id,
            "total": total
        })

    except Exception as erro:

        return jsonify({
            "sucesso": False,
            "erro": str(erro)
        }), 500

# =====================================
# PEDIDOS COZINHA
# =====================================

@app.route("/pedidos", methods=["GET"])
def listar_pedidos():

    try:

        conexao = conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            SELECT
                id,
                numero_mesa,
                status,
                total,
                criado_em
            FROM pedidos
            WHERE status != 'entregue'
            ORDER BY id DESC
        """)

        pedidos = cursor.fetchall()

        for pedido in pedidos:

            cursor.execute("""
                SELECT
                    produto,
                    quantidade,
                    preco,
                    subtotal
                FROM pedido_itens
                WHERE pedido_id=%s
            """, (pedido["id"],))

            pedido["itens"] = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(pedidos)

    except Exception as erro:

        return jsonify({
            "erro": str(erro)
        }), 500

# =====================================
# ACEITAR PEDIDO
# =====================================

@app.route("/pedido/<int:pedido_id>/aceitar", methods=["POST"])
def aceitar_pedido(pedido_id):

    try:

        conexao = conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            UPDATE pedidos
            SET status='preparando'
            WHERE id=%s
        """, (pedido_id,))

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({"sucesso": True})

    except Exception as erro:

        return jsonify({
            "erro": str(erro)
        }), 500

# =====================================
# PEDIDO PRONTO
# =====================================

@app.route("/pedido/<int:pedido_id>/pronto", methods=["POST"])
def pedido_pronto(pedido_id):

    try:

        conexao = conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            UPDATE pedidos
            SET status='pronto'
            WHERE id=%s
        """, (pedido_id,))

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({"sucesso": True})

    except Exception as erro:

        return jsonify({
            "erro": str(erro)
        }), 500

# =====================================
# PEDIDO ENTREGUE
# =====================================

@app.route("/pedido/<int:pedido_id>/entregue", methods=["POST"])
def pedido_entregue(pedido_id):

    try:

        conexao = conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            UPDATE pedidos
            SET status='entregue'
            WHERE id=%s
        """, (pedido_id,))

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({"sucesso": True})

    except Exception as erro:

        return jsonify({
            "erro": str(erro)
        }), 500

# =====================================
# PAINEL DE MESAS
# =====================================

@app.route("/mesas", methods=["GET"])
def listar_mesas():

    try:

        conexao = conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            SELECT
                id,
                numero,
                status
            FROM mesas
            ORDER BY numero
        """)

        mesas = cursor.fetchall()

        for mesa in mesas:

            cursor.execute("""
                SELECT
                    id,
                    total,
                    status,
                    criado_em
                FROM pedidos
                WHERE numero_mesa=%s
                AND status != 'fechado'
                ORDER BY id DESC
            """, (mesa["numero"],))

            pedidos = cursor.fetchall()

            total_conta = 0

            for pedido in pedidos:
                total_conta += float(
                    pedido["total"]
                )

            mesa["pedidos"] = pedidos
            mesa["total_conta"] = round(
                total_conta,
                2
            )

        cursor.close()
        conexao.close()

        return jsonify(mesas)

    except Exception as erro:

        return jsonify({
            "erro": str(erro)
        }), 500

# =====================================
# DETALHES DA MESA
# =====================================

@app.route("/mesa/<int:numero>", methods=["GET"])
def detalhes_mesa(numero):

    try:

        conexao = conectar()
        cursor = conexao.cursor()

        cursor.execute("""
            SELECT *
            FROM pedidos
            WHERE numero_mesa=%s
            ORDER BY id DESC
        """, (numero,))

        pedidos = cursor.fetchall()

        for pedido in pedidos:

            cursor.execute("""
                SELECT *
                FROM pedido_itens
                WHERE pedido_id=%s
            """, (pedido["id"],))

            pedido["itens"] = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(pedidos)

    except Exception as erro:

        return jsonify({
            "erro": str(erro)
        }), 500

# =====================================
# FECHAR CONTA
# =====================================

@app.route("/fechar-mesa/<int:numero_mesa>", methods=["POST"])
def fechar_mesa(numero_mesa):

    print("ENTROU EM FECHAR MESA", numero_mesa)
    try:

        conexao = conectar()
        cursor = conexao.cursor()

        # Busca todos os pedidos da mesa que ainda não foram fechados
        cursor.execute("""
            SELECT
                id,
                total
            FROM pedidos
            WHERE numero_mesa = %s
        """, (numero_mesa,))

        pedidos = cursor.fetchall()

        if not pedidos:

            cursor.close()
            conexao.close()

            return jsonify({
                "sucesso": False,
                "erro": "Nenhum pedido ativo encontrado para esta mesa."
            })

        valor_total_mesa = 0

        # Salva cada pedido no histórico detalhado
        for pedido in pedidos:

            valor_total_mesa += float(
                pedido["total"]
            )

            cursor.execute("""
                INSERT INTO fechamento_caixa
                (
                    pedido_id,
                    numero_mesa,
                    valor
                )
                VALUES
                (
                    %s,
                    %s,
                    %s
                )
            """,
            (
                pedido["id"],
                numero_mesa,
                pedido["total"]
            ))

        # Salva o fechamento geral da conta
        cursor.execute("""
            INSERT INTO fechamento_conta
            (
                mesa_id,
                total
            )
            VALUES
            (
                %s,
                %s
            )
        """,
        (
            numero_mesa,
            valor_total_mesa
        ))

        # Marca os pedidos como fechados
        cursor.execute("""
            UPDATE pedidos
            SET status = 'fechado'
            WHERE numero_mesa = %s
        """, (numero_mesa,))

        # Libera a mesa
        cursor.execute("""
            UPDATE mesas
            SET status = 'livre'
            WHERE numero = %s
        """, (numero_mesa,))

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({
            "sucesso": True,
            "mesa": numero_mesa,
            "valor_total": round(valor_total_mesa, 2)
        })

    except Exception as erro:

      print("\n===== ERRO FECHAR MESA =====")
      print(erro)
      print("============================\n")

      return jsonify({
        "sucesso": False,
        "erro": str(erro)
      }), 500


# =====================================
# INICIAR
# =====================================

if __name__ == "__main__":
    app.run(debug=True)